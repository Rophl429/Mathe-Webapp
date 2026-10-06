# Mathe-Abenteuer

Die bestehende `mathe_abenteuer_version_4.html` im Browser öffnen. Alle sechs JavaScript-Dateien sowie `belohnungen.css` und `statistik.css` müssen im selben Ordner bleiben. Es werden keine externen Bibliotheken benötigt. Für zuverlässige lokale Speicherung möglichst die lokale Vorschau oder später eine feste HTTPS-Adresse statt einer direkt geöffneten Datei verwenden.

## Verwendung

1. Über das Zahnrad oben rechts die Einstellungen öffnen, unter „Was möchtest du üben?“ den Aufgabentyp wählen, danach Zahlenraum, Rechenart und 1–50 Aufgaben einstellen und übernehmen. Das Zahnrad ist in allen Ansichten erreichbar. Solange das Fenster offen ist, pausieren Belohnungsanimationen und der automatische Aufgabenwechsel. Schliessen oder Escape verwirft nicht übernommene Änderungen.
2. Das Kind wählt eine Themenwelt.
3. Auf dem Tastenfeld das Ergebnis eingeben und „Prüfen“ drücken. Bei einer falschen Antwort wird das Antwortfeld automatisch geleert; Rückmeldung, Aufgabe und Fortschritt bleiben erhalten. Die Löschtaste entfernt eine Ziffer, „Leeren“ die ganze Antwort. Eine angeschlossene Tastatur wird ebenfalls unterstützt.
4. Nach einer vollständig richtigen Aufgabe läuft die Belohnungsanimation. Nach 1,9 Sekunden erscheint automatisch die nächste Aufgabe. Nach der letzten Aufgabe erscheint nach 2,4 Sekunden die Abschlussansicht. Bei „Zahlen zerlegen“ folgt nach einem richtigen Zwischenschritt nach 1,1 Sekunden der nächste Schritt; erst der letzte Schritt erhöht den Fortschritt.
5. Auf der Abschlussansicht lässt sich unter „Einstellung für die nächste Etappe“ die Aufgabenanzahl ändern. „Nächste Etappe“ startet den folgenden Abschnitt. Zahlenraum und Rechenart werden über die Themenwahl eingestellt.
6. Nach einer Unterbrechung dieselbe Themenwelt wählen. Bei gleichen Einstellungen wird die angefangene Etappe fortgesetzt, einschliesslich des aktuellen Zerlegungsschritts. Bei geänderten Einstellungen übernimmt eine noch unbegonnene Etappe sie direkt. Bei vorhandenen Eingaben, Lösungen oder Teilschritten erscheint eine Wahl: bisherige Aufgaben fortsetzen oder diese Etappe mit den neuen Einstellungen bei 0 beginnen. Erreichte Reiseziele bleiben erhalten. Das gilt für Aufgabenanzahl, Aufgabentyp, Zahlenraum und Rechenart.
7. Unter den Einstellungen eine Reise auswählen: „Etappe neu starten“ beginnt den aktuellen Abschnitt mit neuen Aufgaben; „Ganze Reise zurücksetzen“ setzt nur diese Themenwelt auf den Anfang zurück. Beide Aktionen haben eine Rückfrage.

Pro Browser gibt es einen gemeinsamen Spielstand mit drei getrennten Reisen. Jede Welt speichert ihre Etappe, Aufgaben, Eingabe und Fortschritt. Ein Themenwechsel ersetzt keine angefangene Etappe in einer anderen Welt. Die zusätzliche lokale Statistik erfasst ausschliesslich Aufgabennutzung und zufällige Kennungen, keine Namen oder echten Geräteinformationen. Auf einem gemeinsam genutzten iPad übernimmt das nächste Kind denselben Spielstand. Gelöschte Browserdaten oder private Browsermodi können das Fortsetzen verhindern. Ein Wechsel zu einem anderen Gerät oder einer anderen Website-Adresse übernimmt den Fortschritt nicht. Falls der Browser die Speicherung blockiert, erscheint ein Hinweis. Vorhandene Spielstände des früheren Prototyps werden als erste Etappe übernommen.

## Dateien

- `app.js`: Einstellungen, Tastenfeld, automatischer Ablauf und lokale Speicherung.
- `aufgaben.js`: Zufallsaufgaben und Prüfung gespeicherter Aufgaben.
- `etappen.js`: Reihenfolge der Reiseziele, Landschaften, Bauprojekte, Endportal und Enderdrache.
- `themen.js`: Thematische Aufgabentexte.
- `belohnungen.js`: Eigene SVG-Zeichnungen, Fortschrittsanimationen und Abschlussansichten.
- `belohnungen.css`: Gestaltung und Bewegungen der Belohnungen.
- `mathe_abenteuer_version_4.html`: Oberfläche und Gestaltung des Prototyps.
- `check-app.cjs`: Logikprüfungen mit `node check-app.cjs`.
- `check-end.cjs`: Portal- und Bosskampfprüfungen mit `node check-end.cjs`.
- `statistik.js`: Lokale Runden-/Aufgabenerfassung, Zeitmessung und vier Statistikansichten.
- `statistik.css`: Eigenständige Gestaltung der Statistik, ohne Änderung der Themenwelten.
- `check-statistik.cjs`: Integrierte Statistiktests mit `node check-statistik.cjs`.
- `STATISTIK-TESTPLAN.md`: Konkreter Ablauf für Tests und Screenshots auf mehreren Geräten.

## Aufgabentypen

Alle drei Typen lassen sich mit jeder Themenwelt und mit Addition, Subtraktion oder beiden Rechenarten kombinieren. Ganze Zahlen und Ergebnisse bleiben innerhalb des gewählten Zahlenraums, ohne negative Ergebnisse. Die Geschichten beschreiben jeweils die ursprüngliche Rechnung.

- **Zehner + Zahl:** Der erste Operand ist ein positives Vielfaches von 10; der zweite liegt zwischen 1 und 99. Beispiele: `30 + 15`, `40 − 7`. Auch bis 1000 bleibt der zweite Operand ein- oder zweistellig.
- **Einer ergänzen:** Zweistellige Ausgangszahl und zweiter Operand von 1 bis 9, ohne Zehnerübergang bei Addition und Subtraktion. `23 + 5` und `48 − 6` sind erlaubt; `27 + 8` und `42 − 6` nicht. Auch bei „bis 1000“ bleiben diese Aufgaben zweistellig.
- **Zahlen zerlegen:** Die zweite Zahl ist zweistellig. Zuerst werden ihre Zehner addiert oder abgezogen, dann ihre Einer. Wenn nötig, werden die Einer nochmals geteilt, um zuerst einen vollen Zehner zu erreichen. Es gibt keine künstlichen Schritte mit 0 und keine feste Zahl von Schritten. Bis 20 kann die Ausgangszahl einstellig sein, damit passende Rechnungen möglich bleiben. Beispiel Addition: `35 + 58` → `35 + 50 = 85`, `85 + 5 = 90`, `90 + 3 = 93`. Beispiel Subtraktion: `93 − 58` → `93 − 50 = 43`, `43 − 3 = 40`, `40 − 5 = 35`. Die Gesamtgleichung wird erst nach erfolgreichem Abschluss angezeigt. Einzelschritte zählen nicht als ganze Aufgaben.

Bei gemischten Durchgängen unterscheiden sich die Anzahlen beider Rechenarten höchstens um eins. Der Generator zieht pro Runde ohne Wiederholung, solange der Vorrat möglicher Rechnungen reicht. Im kleinen Zahlenraum kann bei langen Runden ein neuer Vorrat nötig sein; direkte Wiederholungen werden dennoch vermieden. Alte gespeicherte Runden bleiben als bisherige Aufgaben fortsetzbar; neue Runden verwenden einen der drei Typen.

`node check-app.cjs` prüft unter anderem alle 27 Kombinationen aus Typ, Zahlenraum und Rechenart mit jeweils 50 Aufgaben sowie alle neun Kombinationen aus Themenwelt und Typ, variable Zerlegungen, falsche Antworten, Teilfortschritt, Wiederaufnahme und Belohnungen.

Für einen öffentlichen Link können die neun Website-Dateien später gemeinsam auf einem statischen Webhosting bereitgestellt werden. Eine Offline-Nutzung nach dem Öffnen eines solchen Links ist noch nicht eingerichtet. Der echte iPad-Test steht noch aus. Optional startet `node preview.cjs` eine lokale Vorschau unter `http://localhost:8765` (nur auf diesem Computer erreichbar). Bei belegtem Port: beispielsweise `node preview.cjs 8766`.

## Lokale Statistik

In „Aufgabentypen“ filtern die Schaltflächen **Alle | bis 20 | bis 100 | bis 1000** nach dem exakt ausgewählten Zahlenraum der gespeicherten Runde. „bis 100“ schliesst also weder bis 20 noch bis 1000 ein. Der aktive Filter steht auch in der Überschrift für Screenshots. Beim Wechsel zwischen Statistikbereichen bleibt die Auswahl erhalten; beim erneuten Öffnen der Statistik beginnt sie mit „Alle“. Die übrigen Ansichten und gespeicherten Daten bleiben unverändert. Auch bisher gespeicherte Statistikrunden funktionieren direkt mit dem Filter.

Das Diagrammsymbol links oben auf der Startseite öffnet Gesamtübersicht, Themenwelten, Aufgabentypen und Zahlenräume. Jede Ansicht zeigt dieselbe zufällige sechsstellige Geräte-ID und den Stand beim Öffnen. Bei kleinen Displays bleibt der Kopf beim Scrollen sichtbar. Prozentwerte enthalten immer Zähler und Nenner; bei leerem Nenner erscheint „–“. Die Durchschnittswerte enthalten zusätzlich Summen und Anzahlen zum korrekten Zusammenführen mehrerer Geräte. Screenshots verschiedener Zeitpunkte desselben Geräts sind kumulativ und dürfen nicht addiert werden.

Die Daten liegen in `localStorage`, getrennt von den Spielständen: `mathe-statistik-geraet-v1` enthält die zufällige Kennung, `mathe-statistik-runde-v1:<ID>` jeweils eine Runde mit ihren Aufgaben. Die Kennungen werden mit `crypto.getRandomValues` erzeugt, ohne Geräteinformationen. Die Geräte-ID bezeichnet eigentlich den Browser-Speicher dieser Website, nicht die Hardware: Ein anderer Browser, ein anderes Profil oder eine andere Website-Adresse besitzt andere Daten. Es erfolgen keine Netzwerkanfragen durch die Statistik und es gibt keine Konten, Synchronisation oder Exporte.

Eine neue Etappe erzeugt eine Runde. Fortsetzen verwendet dieselbe Runden-ID. Beim Zurückgehen oder Verbergen der Seite wird eine offene Runde unterbrochen. Beim Fortsetzen wird sie wieder laufend und nach der letzten richtigen Antwort sofort abgeschlossen – unabhängig von der danach abgespielten Belohnung. Neustarts bewahren frühere Statistikrunden. Nach einem Neuladen gelten zuvor laufende Runden zunächst als unterbrochen. Vor der Einführung der Statistik gestartete Runden werden nicht rückwirkend erfasst; ebenso werden nach dem Statistik-Reset bestehende Spielrunden erst durch neue Runden ersetzt, bevor die Erfassung wieder beginnt. Es werden keine alten Lösungszeiten oder Versuche erfunden.

Eine Aufgabe gilt ab der ersten gültigen, geprüften Zahl als bearbeitet. Leeres Prüfen und Klicks während der Animation zählen nicht. Korrekte Pflichtschritte einer Zerlegung bilden zusammen einen Lösungsdurchlauf: Die statistischen Versuche entsprechen falschen Eingaben plus einem begonnenen korrekten Durchlauf. Beispiel: drei korrekte Schritte ohne Fehler = eine Aufgabe, ein Versuch; mit zwei falschen Eingaben = drei Versuche. Eine ungelöste Aufgabe mit nur zwei falschen Eingaben hat zwei Versuche, keinen erfundenen erfolgreichen dritten Versuch. Die Rohdaten enthalten zusätzlich die tatsächliche Anzahl aller geprüften Eingaben. „Beim ersten Versuch richtig“ bedeutet vollständig gelöst ohne falsche Eingabe; „letztlich gelöst“ bedeutet vollständig gelöst unabhängig von Fehlern. Beide Quoten beziehen sich auf alle bearbeiteten Aufgaben. Die Gruppierung nutzt den ausgewählten Zahlenraum; bis 20 wird bei vorhandenen Daten separat angezeigt, niemals dem Hunderterraum untergeschoben.

Die Zeit beginnt nach dem Zeichnen einer bedienbaren Aufgabe und summiert deren aktive Abschnitte. Einstellungen, verborgene Browserseiten, Start-/Statistikansicht, Belohnungsanimationen und automatische Schrittwartezeiten zählen nicht. Falsche Antworten stoppen die Zeit nicht. Rundenzeit ist die Summe aller aktiven Aufgabenzeiten, einschliesslich angezeigter, noch nicht beantworteter Aufgaben. Die durchschnittliche Lösungszeit enthält nur vollständig gelöste Aufgaben; Zeit ungelöster bearbeiteter Aufgaben steht separat. Eine offen im Vordergrund liegende Aufgabe zählt weiter, auch wenn das Kind gerade nicht hinsieht; tatsächliche Aufmerksamkeit lässt sich damit nicht messen.

Gespeichert wird bei Antworten, Übergängen und während aktiver Arbeit spätestens alle fünf Sekunden. Beim abrupten Beenden ohne Browserereignis können die letzten noch nicht gesicherten Sekunden fehlen. Browser können Timer verzögern; eine sekundengenaue Rettung bei Absturz ist nicht garantiert. Gespeicherte Daten bleiben beim normalen Schliessen erhalten. Privatmodus, Löschen von Website-Daten, Browser-/Profilwechsel, Speicherbereinigung oder eine geänderte Hosting-Adresse können Daten entfernen bzw. unzugänglich machen. Speicherung bei `file:`-Adressen hängt vom Browser ab. Daher vor dem Einsatz auf der endgültigen Adresse testen und regelmässig Screenshots erstellen. Eine Warnung im Statistikbereich zeigt erkannte Speicherprobleme; das Rechnen bleibt benutzbar. Pro Gerät bitte nur einen aktiven Tab dieser Website verwenden.

„Statistikdaten zurücksetzen“ verlangt eine Bestätigung. Es löscht nur Statistikrunden dieses Browsers; Geräte-ID und Spielstände bleiben erhalten. Screenshots vorher sichern. Keine automatische Löschung alter Runden. Die Browser-Speicherung ist keine dauerhafte Datensicherung.

## Belohnungen

Jede Etappe benötigt genau die eingestellte Anzahl Aufgaben (1–50). Nach dem letzten Ziel beginnt die nächste Reise wieder am Anfang.

- Dino: Start → Dschungel → Vulkan → Dino-Nest → grosser Schatz. Kleine Schatztruhen an den Zwischenzielen, wechselnde Landschaften und ein grosser Schatz am Ende.
- Weltraum: Erde → Mond → Mars → Jupiter → Raumstation.
- Blockwelt: Haus → Netherportal → Nether-Festung → Endportal → Enderdrache. Die letzte Etappe ist ein spielerischer Bosskampf ohne Bestrafung bei falschen Antworten.

Der Dino läuft mit beweglichen Beinen. Die Rakete fliegt mit kurz sichtbarer Antriebsflamme. Haus, Netherportal und Festung bestehen aus mindestens 50 Bauteilen, die nach richtigen Antworten von oben fallen und kurz nachfedern. Die Verteilung richtet sich nach der Aufgabenanzahl; bei 1–50 Aufgaben erscheint mit jeder richtigen Antwort mindestens ein neues Bauteil. Nach dem Fortsetzen wird der gespeicherte Zustand direkt angezeigt, ohne alte Belohnungen erneut abzuspielen. Die fertige Szene bleibt auf der Abschlussseite erhalten.

Das Netherportal erhält einen räumlichen Rahmen und eine violette Fläche, die beim Abschluss einmal aufleuchtet. Die Festung entsteht mit Brücke, Torbogen, Türmen, Zinnen und Fenstern über Lava.

Das Endportal hat von Anfang an genau 12 räumliche Rahmenblöcke mit leeren Augenfassungen. Die Zahl eingesetzter Augen ist `Math.floor(richtigeAntworten * 12 / GesamtzahlAufgaben)`. Neue Augen fliegen mit 80 Millisekunden Abstand in ihre Fassungen. Erst nach der Landung des letzten Auges aktiviert sich die dunkle Sternenfläche. Portalgeometrie und Grösse hängen nicht von der Aufgabenanzahl ab.

Der Enderdrache erscheint von Anfang an vollständig mit 100 Prozent Lebensenergie. Sein Leben wird aus `(GesamtzahlAufgaben - richtigeAntworten) * 100 / GesamtzahlAufgaben` berechnet; nur die Prozentbeschriftung wird gerundet. Jede vollständig gelöste Aufgabe löst einen kurzen Sprung und Schwertschwung der Spielfigur aus. Der Drache reagiert auf den Treffer, während der Balken sinkt. Der letzte Treffer endet bei exakt 0 Prozent mit einem sanften Verschwinden und „Geschafft!“. Falsche Antworten und einzelne Zerlegungsschritte lösen keinen Angriff aus.

Beide Etappen verwenden ausschliesslich den vorhandenen Aufgabenfortschritt, keinen zusätzlichen gespeicherten Zähler. Wiederaufnahme stellt den passenden Zustand direkt wieder her. Neustart bricht laufende Animationen ab und setzt Augen bzw. Lebensenergie zurück. Mehrfaches Zeichnen desselben Fortschritts löst keine doppelten Animationen aus. Normale Angriffe dauern 1,45 Sekunden, das Finale 2 Sekunden; auch alle 12 Augen bei einer einzigen Aufgabe samt Aktivierung enden vor der bestehenden Abschlusswartezeit von 2,4 Sekunden. Die Systemeinstellung für reduzierte Bewegung wird berücksichtigt. Es werden keine fremden Spielgrafiken verwendet.

Die Logiktests prüfen alle Aufgabenanzahlen von 1 bis 50. `node check-end.cjs` prüft zusätzlich die Animationsabläufe mit 5, 10, 12 und 20 Aufgaben, letzte Augen/letzten Treffer, Wiederaufnahme, Neustart während einer Animation, doppelte Aufrufe und reduzierte Bewegung. Desktop- und iPad-ähnliche Browseransichten wurden geprüft; ein Test auf echter iPad-Hardware bleibt erforderlich.
