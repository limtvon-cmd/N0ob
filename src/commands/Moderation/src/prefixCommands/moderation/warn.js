export default {
  name: 'warn',
  aliases: ['w'],
  description: 'Warn a member',
  usage: '$warn <@user> [reason]',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('❌ You need permission to moderate members');
    }

    const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!member) return message.reply('❌ Member not found');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    message.reply(`⚠️ ${member.toString()} has been warned\n**Reason:** ${reason}`);
  }
};
