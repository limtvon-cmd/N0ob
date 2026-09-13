export default {
  name: 'kick',
  aliases: ['k'],
  description: 'Kick a member',
  usage: '$kick <@user> [reason]',
  category: 'moderation',

  async execute(message, args, client) {
    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('❌ You need permission to kick members');
    }

    const member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!member) return message.reply('❌ Member not found');

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await member.kick(reason);
      message.reply(`✅ ${member.toString()} kicked\n**Reason:** ${reason}`);
    } catch (error) {
      message.reply(`❌ Error: ${error.message}`);
    }
  }
};
