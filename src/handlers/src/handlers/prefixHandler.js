import { Collection } from 'discord.js';
import { logger } from '../utils/logger.js';

export async function loadPrefixCommands(client) {
  client.prefixCommands = new Collection();
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandsPath = path.join(__dirname, '../prefixCommands');

  try {
    const files = await fs.readdir(commandsPath, { recursive: true });
    
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      
      const filePath = path.join(commandsPath, file);
      const command = (await import(`file://${filePath}`)).default;
      
      if (!command.name || !command.execute) {
        logger.warn(`Prefix command at ${file} missing "name" or "execute"`);
        continue;
      }
      
      client.prefixCommands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach(alias => {
          client.prefixCommands.set(alias, command);
        });
      }
      
      logger.info(`Loaded prefix command: ${command.name}`);
    }
  } catch (error) {
    logger.error('Error loading prefix commands:', error);
  }
}

export default loadPrefixCommands;
