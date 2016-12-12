# oe_dojo

Dojo component library for Onroerend Erfgoed UI's.

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
Unit testen worden uitgevoerd met het [Intern framework](https://theintern.github.io/).

Unit testen kan op 2 manieren:
 + via de Intern web client
 + command line via de ChromeDriver (met code coverage)

#### Intern client
De [**Intern client**](https://theintern.github.io/intern/#browser-client) maakt gebruikt van een 
web pagina om alle tests te runnen en het resultaat weer te geven.

Run hiervoor vanuit de project root: 
```bash
$ grunt test-intern
``` 
Dit zal een webserver opstarten, en browsen naar de juiste test pagina. Deze zal je achteraf manueel moet stoppen 
via CTRL-C in de command line.

#### Intern en Chromedriver
De [**ChromeDriver**](https://sites.google.com/a/chromium.org/chromedriver/) zal zelf een Chrome browser openen om alle 
tests in uit te voeren. De Chromedriver wordt via een npm module in het project ingeladen.
 Om de test enkel command line te runnen vanuit de project root: 
```bash
$ grunt test
```
Je kan ook kiezen om na de tests 2 webpagina's te openen met de test resultaten en het coverage report via:
```bash
$ grunt test-html
``` 
Dit zal een webserver opstarten die je achteraf manueel moet stoppen via CTRL-C in de command line.

### Default optie
De default optie als je dit commando runt:
```bash
$ grunt
```
zal achtereenvolgens jshint en en de command line testen uitvoeren.