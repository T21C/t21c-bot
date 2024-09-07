const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } = require('discord.js');
const levelUtils = require('../utils/level');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Gets a level by ID')
		.addNumberOption(option =>
			option.setName('id')
				.setDescription('ID of the level')
				.setRequired(true),
		)
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
		.setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),
	async execute(interaction) {
		await interaction.deferReply();

		const id = interaction.options.getNumber('id');

		const api = axios.create({
			baseURL: apiHost,
		});
		let response;
		try {
			response = await api.get(`levels/${id}`);
		}
		catch (err) {
			if (err.response.status === 404) {
				await interaction.editReply('The level could not be found.');
				return;
			}
			else {
				console.error(err);
			}
		}

		const levelData = response.data;

		const levelEmbed = levelUtils.createLevelEmbed(levelData, interaction);
		const levelButtonsRow = levelUtils.createLevelButtons(levelData);

		await interaction.editReply({ embeds: [levelEmbed], components: [levelButtonsRow] });
	},
};