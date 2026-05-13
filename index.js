console.log("Archivo index.js ejecutándose...");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require("discord.js");

const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once(Events.ClientReady, async () => {
  console.log(`Bot encendido como ${client.user.tag}`);

  const channel = await client.channels.fetch(config.verifyChannelId);

  const embed = new EmbedBuilder()
    .setTitle("🔒 Verificación")
    .setDescription("Bienvenido a *ZandiaGB4L*, para poder ingresar al servidor, deberas proporcionar tu nombre de usuario de Aternos para que tu (si, tu) puedas encender el servidor.\n\n(Cuando presiones Verificarme, te saldra una ventana en la que tienes que ingresar tu nombre de usuario de aternos EXACTO, respetando mayusculas)")
    .setColor(0x3fafff);

  const button = new ButtonBuilder()
    .setCustomId("verify_button")
    .setLabel("Verificarme")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");

  const row = new ActionRowBuilder().addComponents(button);

  await channel.send({
    embeds: [embed],
    components: [row]
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton() && interaction.customId === "verify_button") {
    if (interaction.member.roles.cache.has(config.verifiedRoleId)) {
      return interaction.reply({
        content: "Ya estás verificado.",
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("verify_modal")
      .setTitle("Verificación");

    const usernameInput = new TextInputBuilder()
      .setCustomId("platform_username")
      .setLabel("Proporciona tu nombre de usuario.")
      .setPlaceholder("Ejemplo: Aternosorg, crisyt214")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(usernameInput);

    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "verify_modal") {
    const username = interaction.fields.getTextInputValue("platform_username");

    const staffChannel = await client.channels.fetch(config.staffLogChannelId);

    const logEmbed = new EmbedBuilder()
      .setTitle("Nueva verificación")
      .addFields(
        { name: "Usuario Discord", value: `${interaction.user.tag}` },
        { name: "ID Discord", value: `${interaction.user.id}` },
        { name: "Usuario enviado", value: username }
      )
      .setColor(0x3fafff)
      .setTimestamp();

    await staffChannel.send({ embeds: [logEmbed] });

    await interaction.member.roles.add(config.verifiedRoleId);

    if (config.unverifiedRoleId) {
      await interaction.member.roles.remove(config.unverifiedRoleId).catch(() => {});
    }

    await interaction.reply({
      content: "✅ Verificación completada. Ya tienes acceso al servidor.",
      ephemeral: true
    });
  }
});

client.login(config.token)
  .then(() => console.log("Login enviado correctamente"))
  .catch((error) => {
    console.error("ERROR AL INICIAR SESIÓN:");
    console.error(error);
  });