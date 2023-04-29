// fs is Node's native file system module, used to read the commands directory and identify command files
const fs = require('node:fs');
// path is Node's native path utility module, helps constructs paths to access files and directories. 
const path = require('node:path');

// Require the necessary discord.js classes, add Collection for loading command files
// Collection is an extension of JS's Map class, used to store and retrieve commands to execute.
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//attaches a .commands property to client instance
client.commands = new Collection();


// this retrieves your command files, see "loading command files in docs"
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//hello mario

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// InteractionCreate creates a listener that responds to commands, will execute code if recieves an interaction
// error handling if the command is not found or otherwise does not work
client.on(Events.InteractionCreate, async interaction => {
   // not every interaction is a slash command, this isChatInputCommand makes it so it only responds to slash commands
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});


// Log in to Discord with your client's token
client.login(token);
