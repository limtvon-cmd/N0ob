export default {
  name: 'ban',
  aliases: ['b'],
  description: 'Ban a member',
  usage: '$ban <@user> [reason]',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('BanMembers')) {
      return message.reply('❌ You need permission to ban members');
    }

    const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!member) return message.reply('❌ Member not found');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await message.guild.members.ban(member, { reason });
      message.reply(`✅ ${member.toString()} banned\n**Reason:** ${reason}`);
    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
