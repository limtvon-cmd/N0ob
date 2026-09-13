export default {
  name: 'unban',
  aliases: ['ub'],
  description: 'Unban a user',
  usage: '$unban <user_id> [reason]',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You need permission to unban members');
    }

    const userId = args[0];
    if (!userId) return message.reply('❌ Provide a user ID');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await message.guild.bans.remove(userId, reason);
      message.reply(`✅ User ${userId} unbanned\n**Reason:** ${reason}`);
    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
