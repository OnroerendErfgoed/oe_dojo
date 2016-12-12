# oe_dojo

Dojo library for Onroerend Erfgoed UI's

## Installatie
Je kan de library in je project toevoegen via Bower: 
```bash
bower install https://github.com/OnroerendErfgoed/oe_dojo.git#<release nummer> --save
```

## Development
Check het project uit en run deze commando's:
```bash
$ npm install
$ bower install
```

## Testen
### Code quality
Code quality wordt getest via [jshint](http://jshint.com/). 
Run hiervoor vanuit de project root:   
```bash
$ grunt jshint
```

### Unit testen
Unit testen kan op 2 manieren:
 + via de Intern web client
 + command line via de ChromeDriver (met code coverage)
 
De [**Intern client**](https://theintern.github.io/intern/#browser-client) maakt gebruikt van een web pagina om alles tests te runnen en het resultaat weer te geven.
Run hiervoor vanuit de project root:   
```bash
$ grunt webtest
``` 
Dit zal een webserver opstarten die je command line manueel meot stoppen via CTRL-c.

De [**ChromeDriver**](https://sites.google.com/a/chromium.org/chromedriver/) zal zelf een Chrome browser openen om alle tests in uit te voeren. Nadien worden 2 webpagina's 
geopen met de test resultaten en het coverage report.

Run hiervoor vanuit de project root:   
```bash
$ grunt test
```
Hiervoor dient de Chrome Web Driver wel nog manueel gedownload te worden en runnen op poort 4444.
Dit kan met volgend commando vanuit de justte directory:
```bash
$ ./chromedriver --port=4444 --url-base=wd/hub
```


Dit zal een webserver opstarten die je command line manueel meot stoppen via CTRL-c.