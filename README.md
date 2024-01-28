Original English README below

# Интерфейс настройки контроллера LightHub
Постоянная память контроллера слишком мала, чтобы на ней можно было разместить полноценный интерфейс по его настройке.
Точнее, это можно сделать, но в ущерб функциональности, занимая ценную память и ресурсы для веб содержимого, совершенно бесполезного, когда контроллер уже настроен и просто работает


# Плагин для браузера 

## Преимущества:
  * Весь веб-контент лежит внутри плагина, в вашем браузере. Кроме того, что не требуется доступ в интернет, решается и вопрос безопасности - chrome позволяет браузеру использовать API контроллера в локальной сети
  * Появляется возможность поиска контроллеров в вашей локальной сети, так как в них давно реализован протокол MDNS

Недостаток тут только один - надо потратить 5 минут на установку этого плагина.
Так как браузер не имеет прав просканировать локальную сеть на предмет наличия контроллеров, плагин использует утилиту zeroconf_lookup которая была разработана в рамках открытого проекта https://github.com/railduino/zeroconf-lookup

На базе этого проекта, я сделал прототип плагина для конфигурирования контроллеров lighthub
https://github.com/anklimov/zeroconf-lighthub

Плагин состоит из двух частей:
  * Собственно плагин браузера
  * Утилита поиска zeroconf-lookup

## Скачивание проекта 
Скачивание и разархивирование надо сделать перед началом всех последующих действий

  - На странице проекта https://github.com/anklimov/zeroconf-lighthub скачиваем архив (нажать зеленую кнопку Code и выбрать download ZIP)
  - Разархивируем в какую-либо папку, которую вы в дальнейшем не будете удалять (например \Users\youName\plugin) 
  - (если вы разработчик - вместо предыдущих двух пунктов, вы, конечно, предпочтете использовать утилиту git)<code>git clone https://github.com/anklimov/zeroconf-lighthub</code>

## Как установить плагин: 
  * Установить из магазина приложений Chrome (чуть позже выложу)
  * Установить из папки, скачанной с ГитХаб в режиме разработчика. Это не сильно сложнее, но позволит дорабатывать плагин (очень надеюсь на то, что кто-то будет его дорабатывать, я не веб разработчик). 
     * Для этого открываем браузер chrome, в меню "расширения" выбираем "управление расширениями". 
     * Включаем переключатель "режим разработчика", 
     * нажимаем кнопку"Загрузить распакованное расширение". 
     * Выбираем папку __zeroconf-lighthub-master/Chrome__ в распакованном на предыдущем этапе архиве
     * Расширение устанавливается, заглядываем на страницу его свойств и копируем идентификатор расширения (например gepnlbipogackhpjkojhkonkijdgpgji ) это нам пригодится чуть позже


## Как установить утилиту: 

### Windows 

  - Переходите в каталог __zeroconf-lighthub-master\Windows_Go__ 
  - Из командной строки запускаете - <code>zeroconf_lookup.exe -i -с gepnlbipogackhpjkojhkonkijdgpgji</code> (тут укажите ваш идентификатор расширения, скопированный на предыдущем этапе)
  - После этого переносить данный файл с этого места или удалять папку нельзя
  - Если ставили плагин из магазина приложений - можно при запуске не указывать идентификатор расширения. <code>zeroconf_lookup.exe -i</code> 


### MacOS 
то же самое, только выполнимый файл лежит в директории __zeroconf-lighthub/Apple_Go__


## Использование 
Теперь все просто - нажимаем на иконку расширения - оно сканирует сеть и выдает перечень всех контроллеров онлайн в локальной сети (и не только контроллеров - любых устройств, которые заявляют о себе)

Для входа в настройки контроллера надо нажать Edit напротив него в списке


# zeroconf-lookup

Browser WebExtension for finding local web servers using Zeroconf
(which is called Bonjour in the OS X / macOS world).

Hint: this is still work-in-progress and growing fast.
Please be patient if it does not immediately work out of the box.

## WebExtensions and Zeroconf

In recent Chrome and Firefox browsers (as well as in Safari and others)
the Zeroconf discovery has been removed for security reasons. It seems
that the only viable alternative is using WebExtensions and
NativeMessaging. They work almost identical in both browsers, with
Chrome leading the way and Firefox following suit.

NativeMessaging requires an independent host application. This
application needs to be installed independently from the browser by
means of the operating system. The browser will nevertheless invoke and
terminate this application as needed.

## Purpose of this repository

This repository aims to provide various methods for getting back
Zeroconf into the browser(s). It contains both the standalone host
application (in various flavors) and the source code of the browser extensions.

So far, I have not been able to use connection-based messaging, only connectionless.
A possible hint can be found under
https://discourse.mozilla.org/t/connection-based-native-messaging-doesnt-work-in-popups/17185

By means of a config file it is possible to send **LOG** and **DEBUG** messages.
See below for configuring. Since this logfile will be overwritten by every invocation, it will not grow.

### Configuration

**to be added - call `zeroconf_lookup -h` or check the source code - sorry I'm still working on it**


# Installation

For installing the *native host* program, see the INSTALL.md file in this directory.

## Installation – Firefox and Chrome / Chromium WebExtension

To install the *browser extension* search for **zeroconf** in the appropriate app stores.

For Firefox It can also be installed in debugging mode from the Git repository.
See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/WebExtensions_and_the_Add-on_ID#Basic_workflow_with_no_add-on_ID
for an explanation how to install. The Firefox directory within the
local copy of the repository is the location that needs to be loaded.

The same is possible for Chrome / Chromium
See https://developer.chrome.com/extensions/getstarted#unpacked

# Contributing to this repository

Contributions and comments are welcome.


