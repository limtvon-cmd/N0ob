import { EmbedBuilder, logger } from 'discord.js';
import { getColor } from '../config/bot.js';

export class BoostService {
  constructor(client) {
    this.client = client;
    this.db = client.db;
  }

  // SETUP BOOST SYSTEM
  async setupBoostSystem(guild, config = {}) {
    try {
      const {
        role1 = null,
        role2 = null,
        role3 = null,
        role4 = null,
        role5 = null,
        logChannel = null,
      } = config;

      // Validate roles
      const roles = [role1, role2, role3, role4, role5].filter(r => r !== null);
      for (const roleId of roles) {
        const role = await guild.roles.fetch(roleId).catch(() => null);
        if (!role) throw new Error(`Role ${roleId} not found`);
      }

      await this.db.query(
        `INSERT INTO boost_config (guild_id, role1, role2, role3, role4, role5, log_channel, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (guild_id) DO UPDATE SET 
         role1 = $2, role2 = $3, role3 = $4, role4 = $5, role5 = $6, log_channel = $7`,
        [guild.id, role1, role2, role3, role4, role5, logChannel]
      );

      return true;
    } catch (error) {
      logger.error('Error setting up boost system:', error);
      throw error;
    }
  }

  // GET BOOST CONFIG
  async getBoostConfig(guildId) {
    try {
      const result = await this.db.query(
        `SELECT * FROM boost_config WHERE guild_id = $1 LIMIT 1`,
        [guildId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error fetching boost config:', error);
      return null;
    }
  }

  // HANDLE MEMBER BOOST
  async handleMemberBoost(guild, member) {
    try {
      const config = await this.getBoostConfig(guild.id);
      if (!config) return;

      const boostCount = await this.getBoostCount(guild.id, member.id);
      const roleId = this.getRoleForBoostCount(config, boostCount);
      
      if (roleId) {
        const role = await guild.roles.fetch(roleId).catch(() => null);
        if (role) await member.roles.add(role);
      }

      await this.logBoost(guild, member, boostCount);
      await this.db.query(
        `INSERT INTO user_boosts (guild_id, user_id, boost_count, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (guild_id, user_id) DO UPDATE SET boost_count = $3`,
        [guild.id, member.id, boostCount]
      );

      return true;
    } catch (error) {
      logger.error('Error handling member boost:', error);
      throw error;
    }
  }

  // GET BOOST COUNT
  async getBoostCount(guildId, userId) {
    try {
      const result = await this.db.query(
        `SELECT boost_count FROM user_boosts WHERE guild_id = $1 AND user_id = $2 LIMIT 1`,
        [guildId, userId]
      );
      return result.rows[0]?.boost_count || 1;
    } catch (error) {
      logger.error('Error getting boost count:', error);
      return 1;
    }
  }

  // GET ROLE FOR BOOST COUNT
  getRoleForBoostCount(config, boostCount) {
    const roleMap = {
      1: config.role1,
      2: config.role2,
      3: config.role3,
      4: config.role4,
      5: config.role5,
    };
    return roleMap[Math.min(boostCount, 5)];
  }

  // LOG BOOST
  async logBoost(guild, member, boostCount) {
    try {
      const config = await this.getBoostConfig(guild.id);
      if (!config?.log_channel) return;

      const logChannel = await guild.channels.fetch(config.log_channel).catch(() => null);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setColor(getColor('primary'))
        .setTitle('🚀 Server Boost')
        .setDescription(`${member.toString()} has boosted the server!`)
        .addFields(
          { name: 'Total Boosts', value: boostCount.toString(), inline: true },
          { name: 'Timestamp', value: new Date().toLocaleString(), inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

      await logChannel.send({ embeds: [embed] }).catch(err => logger.error('Error:', err));
    } catch (error) {
      logger.error('Error logging boost:', error);
    }
  }

  // CREATE BOOST PANEL
  async createBoostPanel(guild, channelId, description = '') {
    try {
      const channel = await guild.channels.fetch(channelId);
      
      const embed = new EmbedBuilder()
        .setColor(getColor('primary'))
        .setTitle('🚀 Boost Rewards')
        .setDescription(description || 'Boost this server to receive exclusive roles!')
        .addFields(
          { name: '✨ How it Works', value: 'When you boost, you receive special roles based on your boost count.' },
          { name: '1️⃣ First Boost', value: 'Role 1 reward' },
          { name: '2️⃣ Second Boost', value: 'Role 2 reward' },
          { name: '3️⃣ Third Boost', value: 'Role 3 reward' },
          { name: '4️⃣ Fourth Boost', value: 'Role 4 reward' },
          { name: '5️⃣ Fifth Boost', value: 'Role 5 reward' }
        )
        .setTimestamp();

      const config = await this.getBoostConfig(guild.id);
      if (config) {
        const roleOptions = [];
        for (let i = 1; i <= 5; i++) {
          const roleId = config[`role${i}`];
          if (roleId) {
            const role = await guild.roles.fetch(roleId).catch(() => null);
            if (role) roleOptions.push(`**Role ${i}:** ${role.toString()}`);
          }
        }
        if (roleOptions.length > 0) {
          embed.addField('🎁 Active Rewards', roleOptions.join('\n'));
        }
      }

      await channel.send({ embeds: [embed] });
      return true;
    } catch (error) {
      logger.error('Error creating boost panel:', error);
      throw error;
    }
  }

  // GET BOOST STATS
  async getBoostStats(guildId) {
    try {
      const result = await this.db.query(
        `SELECT 
          COUNT(*) as total_boosters,
          AVG(boost_count) as avg_boosts,
          MAX(boost_count) as max_boosts
         FROM user_boosts 
         WHERE guild_id = $1`,
        [guildId]
      );
      return result.rows[0] || { total_boosters: 0, avg_boosts: 0, max_boosts: 0 };
    } catch (error) {
      logger.error('Error getting boost stats:', error);
      return null;
    }
  }
}

export default BoostService;
