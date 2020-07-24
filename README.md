# Telegram bot menu

Telegram bot with universal editable menu. With this program, you do not need to write code for the bot with the menu. Just run the bot and configure its menu via Telegram.

**THIS IS A FORK. THE ORIGINAL IS AT:**
https://github.com/zZoMROT/telegram-bot-menu/

## Getting Started

1. Use Telegram's official [@BotFather](http://t.me/BotFather) to create a bot token.
2. Set the bot's [TOKEN](https://github.com/WaseemAlkurdi/telegram-bot-menu/blob/master/init.js#L9) variable in `init.js` to the token that BotFather gives you:
   ```
   var TOKEN = '<YOUR_TOKEN>';
   ```
3. Install `node` and `npm` if you don't already have them installed:
   ```
   sudo apt-get install node npm
   ```
3. If you want to edit the bot's menu through the bot, make sure that you have `sed` installed.
   ```
   sudo apt-get install sed
   ```
4. Install the prerequisite modules via the Node.js package manager `npm`:
   ```
   npm install --save telegram-bot-api socks5-http-client node-emoji
   ```
5. To start the bot: 
   ```
   mkdir data
   node bot.js menu data
   ```
   This starts the bot in menu mode. To allow editing, change the command as follows:
   ```
   node bot.js menu data edit Username,001122334 
   ```
   where `Username` and `001122334` are Telegram usernames or user IDs of accounts that should be allowed edit access to the menu (bot admins). **Make sure there are no spaces after the commas.**

   **Note:** The bot can also be started as follows:
   ```
   node bot.js menu data edit
   ```
   but this is **strictly not recommended** in a production environment as it will open up the menu to editing by all Telegram users.


## Syntax

```
node bot.js menu.file data.folder [mode [username|telegram_id|all]]
```

* **menu.file**   
  File with menu
* **data.folder**   
  Path to folder with payload which bot responds when the buttons is clicked
* **mode [username|telegram_id|all]**   
  Bot mode. 
  Use **edit** to configurate menu.   
  You can use users **username** and **telegram_id**, separated by commas, for differentiation of access to edit menu.   
  If you use **all** or nothing then all users can edit menu.


## Edit mode

In this mode you can:
* click buttons as standart menu
* click buttons without actions with buttons *BUTTON|wa* for testing the menu tree
* edit actions for buttons
* delete buttons
* create buttons
* export menu to special file which you can import in future
* import menu from special file

## Menu file

  File with menu catalogs in format 
  ```
  PARRENT:::CATALOG:::BUTTON[:::ACTION[:::ACTION[...]]]
  ```
  In this file there must be at least one line with PARRENT=root  
  For successful start in the configuration file one line is enough:
  ```
  root:::main:::button1
  ```
  Actions must be in json format for each action, for example: 
  ```
  {"type":"text","value":"hello world!"}
  ```

  **Action types:**   
  * text   
  * voice
  * sticker
  * photo
  * video
  * location
  * document
  * contact  
   
For *location* action value use next format: longitude_latitude
```
root:::main:::button1:::{"type":"location","value":"-73.935242_40.730610"}
```
For *contact* action value use next format: phone_name
```
root:::main:::button1:::{"type":"contact","value":"79001112233_Bob"}
```  
For *voice*, *sticker*, *photo*, *video* and *document* actions value use path to file for import (see section **Export and Import menu**) or file_id from Telegram to which the bot has access.
```
root:::main:::button1:::{"type":"photo","value":"data/file_1.jpg"}
``` 
```
root:::main:::button1:::{"type":"photo","value":"AgADAgADD6kxGyCP4UgS5DhiGXJJgYLdtw4ABLJZLw2sc33Mx20DAAEC"}
``` 
## Export and Import menu
You can export and import menu when bot started with edit mode.   
For export your menu to file *menu.export* you can use command **/export menu.export** in bot chat, it's start bot to dowanload all actions load from Telegram to *data.folder* and create file with menu for import.

For import your menu from file *menu.export* you can use command **/import menu.export** in bot chat, it's start bot to upload all actions load from *data.folder* to Telegram and modify your *menu.file* with new data from *menu.export*.   

In file *menu.export* actions value indicate a local file, but bot use Telegram file_id in work. If you want  create *menu.file* by yourself without Telegram and you use *voice*, *sticker*, *photo*, *video* or *document* actions, you need import. 

## Ideas for develop
  * add a proxy to telegram bot
  * add action 'script' to execute any utils ```{"type":"script","value":"myProgram"}```, ```{"type":"script","value":"cat menu.file"}```
  * add handler for **/commands** with actions to file.menu ```COMMANDS:::help:::{"type":"text","value":"/help"}```
  * add configuration file for change delimeter, default answers and etc. params from init.js without using source code
