import levelUtils from '../../utils/level'

module.exports = {
    async execute(interaction) {
        if (!interaction.customId.split('_')[1] === interaction.user.id) {
            return
        }

        await interaction.deferUpdate()

        const levelId = interaction.values[0].split('_')[1]

        const levelResponse = await levelUtils.getTUFApi(
            `database/levels/${levelId}`
        )
        const passResponse = await levelUtils.getTUFApi(`database/passes/level/${levelId}`)
        
        const levelData = levelResponse.data
        const passesData = passResponse.data

        const levelEmbed = await levelUtils.createLevelEmbed(
            levelData,
            passesData
        )
        const levelButtonsRow = levelUtils.createLevelButtons(levelData)

        await interaction.editReply({
            content: '',
            embeds: [levelEmbed],
            components: levelButtonsRow
        })
    }
}
