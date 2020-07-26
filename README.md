# Telegram bot menu

Telegram bot with universal editable menu. With this program, you do not need to write code for the bot with the menu. Just run the bot and configure its menu via Telegram.

**THIS IS A FORK. THE ORIGINAL IS AT:**
https://github.com/zZoMROT/telegram-bot-menu/

## Project aims

This fork aims at providing a free software reimplementation of popular Telegram menu bots, with [@Manybot](http://t.me/Manybot) as an archetype.

* Simple: This project aims at replicating the simplicity of Manybot in particular.
* Transparent: Unlike other bots, this project lets you import and export your menu. Your data is yours. Additionally, the code is open-source, and you're free to examine and contribute.
* Resilient: Since you host the bot on your own servers, you don't need to worry about the original, prorietary server disappearing, costing you both your data and your users.
* Compartmentalized: features are written in well-demarcated functions in separate `.js` files for each module. The code is easy to get into, and JavaScript is a relaxed language.

## Getting Started 

**One-click deployment:**
Just click this button! (work in progress)

**Run locally from code (for developers):**

1. Clone this repository to your local computer: 
```
git clone http://github.com/WaseemAlkurdi/telegram-bot-menu
```
2. Use Telegram's official [@BotFather](http://t.me/BotFather) to create a bot token. This token is the "master key" to your bot - **protect this token at all costs, anybody who possesses this token can take over your bot!**
3. To set the token, create an empty file (henceforth called the *customization file*) with the following text:
  ```
    {
      "token":"<YOUR_TOKEN>"
    }
  ```
  For example:
  ```
    {
      "token":"1122334455:AABB-CcdD6e-ffg7hi8jk-mnoPqRSt9uv0w"
    }
  ```
  Save this file as `cust_file`, or any other name you wish.
  * alternatively, set the bot's [TOKEN](https://github.com/WaseemAlkurdi/telegram-bot-menu/blob/master/init.js#L9) variable in `init.js` to the token that BotFather gives you:
   ```
   var TOKEN = '<YOUR_TOKEN>';
   ```
4. Install `node` and `npm` if you don't already have them installed:
   ```
   sudo apt-get install node npm
   ```
5. If you want to edit the bot's menu through the bot, make sure that you have `sed` installed.
   ```
   sudo apt-get install sed
   ```
6. Install the prerequisite modules via the Node.js package manager `npm`:
   ```
   npm install --save telegram-bot-api socks5-http-client node-emoji
   ```
7. Start the bot:
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
node bot.js menu.file data.folder [mode [username|telegram_id|all]] cust_file=customization.file
```

* **menu.file**   
  Path to the menu file.
* **data.folder**   
  Path to a folder holding the menu's payload (for example, pictures and videos which the bot sends).
* **mode [username|telegram_id|all]**   
  Bot mode. 
  Use **edit** to configure menu by interacting with the bot on Telegram.   
  You can specify users (**username** and/or **telegram_id**), separated by commas, to limit access to your bot's menu.   
  If you use **all** (or specify no Telegram accounts), then all users can edit the menu.
* **cust_file=customization.file**
  Path to a customization file to be loaded by the bot. See [todo] below for details.

## Edit mode

In this mode you can:
* click buttons as a user would interact with them
* click buttons without actions with buttons *BUTTON|wa* for testing the menu tree
* edit actions for buttons
* delete buttons
* create buttons
* export menu to a file for future use
* import menu from a file.

## Menu file syntax

  File with menu catalogs in the following format:
  ```
  PARENT:::CATALOG:::BUTTON[:::ACTION[:::ACTION[...]]]
  ```
  In this file there must be at least one line with PARENT=root  
  The bare minimum to successfully start is one line in the menu file:
  ```
  root:::main:::button1
  ```
  Actions must be specified in `json` format. For example: 
  ```
  {"type":"text","value":"hello world!"}
  ```

## Menu actions
  **Action types:**   
  * text   
  * voice
  * sticker
  * photo
  * video
  * location
  * document
  * contact  
   
For the *location* action, the value should use the following format: `longitude_latitude`
```
root:::main:::button1:::{"type":"location","value":"-73.935242_40.730610"}
```
For the *contact* action, the value should use the following format: `phone_name`
```
root:::main:::button1:::{"type":"contact","value":"79001112233_Bob"}
```  
For *voice*, *sticker*, *photo*, *video* and *document* actions, the value should use the local path to file (on the server hosting the bot) for import (see the **Export and Import menu** section) or `file_id` from a Telegram account/chat to which the bot has access.
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

## Customization
If you don't like the bot's predefined messages, or you simply like adding your personal touch to your bot, we've got you covered. You can tweak any or all of the following without touching the source code:
  * Welcome message (sent on the first interaction with the bot)
  * Default message (sent when selecting a menu item that doesn't have its own message)
  * Desync message (sent when the bot's on-disk menu file is modified while the bot is running)
  * Menu file delimiter (in case you're allergic to `:::` ;-P)
  * Prompts, for example: "Add item", "add action", and "editing canceled" 

  You can also use the file to specify a proxy to connect through, if one is needed to connect to Telegram.

To edit any of the above, create a text file that specifies the values as JSON pairs. 
A complete example can be found below:
```
{
  "token":"1122334455:AABB-CcdD6e-ffg7hi8jk-mnoPqRSt9uv0w",
  "delimiter":":::",
  "start_message":"Welcome! This is the start message.",
  "proxy":{
    "host":"123.4.5.6",
    "port":"80",
    "username":"test",
    "password":"M=CfHw%N[iV"
  }

}
```


## Ideas for future development
  * ~add a proxy to telegram bot~ - implemented in commit 48dcdd from the original project
  * add action 'script' to execute any utils ```{"type":"script","value":"myProgram"}```, ```{"type":"script","value":"cat menu.file"}```
  * add handler for **/commands** with actions to file.menu ```COMMANDS:::help:::{"type":"text","value":"/help"}```
  * ~add configuration file for change delimeter, default answers and etc. params from init.js without using source code~ - added in commit 42ef65 of this fork