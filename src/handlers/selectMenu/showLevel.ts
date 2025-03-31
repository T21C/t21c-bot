import levelUtils from '../../utils/level'

module.exports = {
    async execute(interaction) {
        if (!interaction.customId.split('_')[1] === interaction.user.id) {
            return
        }

        await interaction.deferUpdate()

        const levelId = interaction.values[0].split('_')[1]

        const response = await levelUtils.getTUFApi(
            `database/levels/${levelId}`
        )
        const levelData = response.data

        const passesData = levelData.passes

        const levelEmbed = await levelUtils.createLevelEmbed(
            levelData,
            passesData,
            interaction
        )
        const levelButtonsRow = levelUtils.createLevelButtons(levelData)

        await interaction.editReply({
            content: '',
            embeds: [levelEmbed],
            components: levelButtonsRow
        })
    }
}
