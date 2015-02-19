# Funkzellenuebersicht

## WLAN Standorte der Universität Münster

Datenquellen & Tools:
 
* WLANs: [NIC_online](https://www.nic.uni-muenster.de/Funkzellenuebersicht.asp)
* `NodeJS` Script zum Erzeugen der geojson Datei

Die Datei **`WWU_WLANs.geojson`** enthält alle WLAN Standorte mit Koordinaten und kann hier auf Github direkt auf einer Karte angesehen werden.

## Script ausführen

Das NodeJS Script Zum Erzeugen der `WWU_WLANs.geojson` ruft die Seiten des ZIV auf ("NIC_online") und weist den Adressen in der Tabelle mit Hilfe der [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding/) Koordinaten zu. Das dauert etwas, da die Google Geocoding API bei zu vielen Aufrufen sperrt. Anschließend wird das Ergebnis in die `WWU_WLANs.geojson` gespeichert.

```bash
npm install
nodejs index.js
```