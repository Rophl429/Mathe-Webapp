# Testplan für die lokale Statistik

## Vorbereitung

Auf jedem Testgerät denselben endgültigen HTTPS-Link in einem normalen Browserfenster öffnen. Auf dem Computer kann zunächst `node preview.cjs` verwendet werden; dieser lokale Vorschau-Link funktioniert nicht auf anderen Geräten. Keine privaten Tabs verwenden. Nur einen aktiven Tab pro Gerät offen halten.

Links oben das Diagrammsymbol öffnen. Geräte-ID notieren bzw. fotografieren. Auf einem zweiten Gerät sollte eine andere ID und eine eigene leere Statistik erscheinen. Die ID ist zufällig, nicht aus Geräteinformationen abgeleitet. Bei mehreren Browsern auf demselben Gerät entstehen ebenfalls getrennte IDs.

Die folgenden Tests zunächst nur mit Testdaten durchführen. Vor einem späteren Statistik-Reset echte Ergebnisse immer durch Screenshots sichern. Falls noch eine alte Etappe gespeichert ist, vor dem Test über das Zahnrad eine neue Etappe starten, dann zur Startseite zurückgehen und die Teststatistik zurücksetzen. Anschliessend nochmals eine neue Etappe starten, damit sie von Anfang an erfasst wird.

## 1. Bekannte Ergebnisse herstellen

1. Zehner + Zahl, bis 100, zwei Aufgaben einstellen und Dinosaurier wählen.
2. Erste Aufgabe sofort richtig beantworten.
3. Bei der zweiten Aufgabe zweimal absichtlich falsch antworten, danach richtig.
4. Abschluss abwarten, zur Themenwahl zurück und Statistik öffnen.

Erwartet: eine gestartete und abgeschlossene Runde, zwei bearbeitete Aufgaben, **1 von 2 (50 %) beim ersten Versuch richtig**, **2 von 2 (100 %) letztlich gelöst**. Vier statistische Versuche insgesamt, Durchschnitt **2,00**. Die Zeit ist grösser als null. Die Belohnungen laufen wie bisher.

## 2. Unterbrechen und fortsetzen

1. Neue Runde mit drei Aufgaben im Weltraum starten.
2. Eine Aufgabe lösen, bei der nächsten einmal falsch antworten und „Zurück“ wählen.
3. Statistik prüfen: insgesamt zwei Runden, davon eine abgeschlossen und eine unterbrochen; vier bearbeitete Aufgaben insgesamt.
4. Website neu laden. ID und Zahlen müssen erhalten bleiben.
5. Weltraum erneut wählen und die gespeicherte Runde vollständig lösen.

Erwartet: weiterhin zwei gestartete Runden, jetzt beide abgeschlossen. Kein zusätzlicher Rundenstart durch Fortsetzen. Bereits bearbeitete Aufgaben zählen nicht doppelt. Browser vollständig schliessen, erneut öffnen und prüfen, dass ID und Ergebnisse erhalten bleiben.

## 3. Zerlegungen und Zahlenräume

1. Eine neue Minecraft-Runde mit „Zahlen zerlegen“, bis 1000 und einer Aufgabe beginnen.
2. Jeden Pflichtschritt ohne Fehler lösen.
3. Statistik unter Aufgabentypen/Zahlenräume prüfen.

Erwartet: eine zusätzliche Aufgabe, ein statistischer Versuch und „beim ersten Versuch richtig“, unabhängig von zwei oder drei Pflichtschritten. Als weitere Runde dieselbe Konfiguration mit zwei falschen Eingaben auf beliebigen Schritten testen: eine zusätzliche Aufgabe mit drei Versuchen. „Einer ergänzen“ ebenfalls ausprobieren. Haus, Portale und Drache sollen weiterhin normal reagieren.

## 4. Aktive Zeit und Pausen

1. Neue Runde mit einer einfachen Aufgabe starten, ungefähr fünf Sekunden ansehen.
2. Einstellungen öffnen, 30 Sekunden warten, schliessen.
3. Noch ungefähr fünf Sekunden arbeiten, dann für 30 Sekunden zu einer anderen App oder einem anderen Tab wechseln.
4. Zur Website zurückkehren und nach ungefähr fünf Sekunden richtig antworten.

Erwartet: ungefähr 15 Sekunden plus Bedienzeit, nicht 75 Sekunden. Die Rundendauer steigt während der Belohnungsanimation nicht. Bei einer weiteren Runde nach einer falschen Eingabe abbrechen: deren Zeit steht separat unter ungelösten Aufgaben und verändert nicht die durchschnittliche Lösungszeit. Eine Aufgabe ohne Antwort darf die aktive Rundendauer erhöhen, aber noch nicht „bearbeitete Aufgaben“.

## 5. Screenshot-Ansichten

Jeden Bereich öffnen: Gesamtübersicht, Themenwelten, Aufgabentypen, Zahlenräume. Im iPad-Hochformat sollte der Zahlenbereich jeweils auf einen Screenshot passen. Auf Smartphones sind mehrere Aufnahmen möglich; die Geräte-ID bleibt beim Scrollen oben sichtbar. Hoch- und Querformat ausprobieren. Keine abgeschnittenen Zahlen und kein horizontales Scrollen.

Pro Gerät möglichst alle vier Bereiche direkt nacheinander aufnehmen, bevor weitergerechnet wird. Für die Zusammenführung nur den letzten Stand jedes Geräts verwenden, nicht mehrere kumulative Zwischenstände addieren. Prozentwerte neu aus summierten Zählern/Nennern berechnen. Durchschnittliche Versuche = Summe der Versuche / Summe bearbeiteter Aufgaben; durchschnittliche Lösungszeit = Summe der Lösungszeiten / Summe gelöster Aufgaben. Die dafür benötigten Summen stehen auf den Karten.

## 6. Löschen absichern

Nur mit Testdaten: „Statistikdaten zurücksetzen“ wählen, zunächst abbrechen. Alle Zahlen bleiben erhalten. Erneut wählen und bestätigen: Statistik leer, Geräte-ID gleich, Spielstände unverändert. Eine wirklich neue Runde starten und prüfen, dass die Erfassung wieder bei einer Runde beginnt. Andere Geräte bleiben unverändert. Keine CSV-Datei, Anmeldung oder Berechtigungsabfrage darf erscheinen.

## Vor dem Praxiseinsatz

- Tests auf den tatsächlichen Schul-iPads mit Safari und dem endgültigen Link wiederholen.
- Keine Testdaten in der späteren Untersuchung belassen; Statistik zurücksetzen und neue Etappen starten.
- Nach jeder Unterrichtseinheit die vier Ansichten sichern. Browserdaten nicht löschen.
- Bei einem Speicherhinweis Daten sofort per Screenshot sichern; nicht auf weitere dauerhafte Speicherung vertrauen.
- Aufmerksamkeit oder Motivation lassen sich aus Zeit und Erfolgsquoten allein nicht ableiten; Beobachtungen der Lehrperson ergänzen die Auswertung.
