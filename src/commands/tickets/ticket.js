import { SlashCommandBuilder } from 'discord.js';
import TicketService from '../../services/ticketService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a support ticket')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Ticket category')
        .setRequired(true)
        .addChoices(
          { name: 'Support', value: 'support' },
          { name: 'Report', value: 'report' },
          { name: 'Suggestion', value: 'suggestion' }
        )
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for ticket')
        .setRequired(false)
    ),

  async execute(interaction) {
    const ticketService = new TicketService(interaction.client);
    const category = interaction.options.getString('category');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Check if blacklisted
    const isBlacklisted = await ticketService.isUserBlacklisted(interaction.guildId, interaction.user.id);
    if (isBlacklisted) {
      return interaction.reply({ content: '❌ You are blacklisted from creating tickets.', ephemeral: true });
    }

    try {
      await interaction.deferReply({ ephemeral: true });
      const ticketChannel = await ticketService.createTicket(
        interaction.guild,
        interaction.member,
        category,
        reason
      );

      interaction.editReply({ content: `✅ Ticket created! ${ticketChannel.toString()}` });
    } catch (error) {
      interaction.editReply({ content: '❌ Error creating ticket' });
    }
  }
};
