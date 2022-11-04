# milionerzy

## PL
Gra przeglądarkowa Quiz wzorowana na programie telewizyjnym Milionerzy.
Projekt został stworzony w środowisku node.js z wykorzystaniem bazy danych SQLite oraz protokołu WebSocket do komunikacji klienta z serwerem. Aplikacja wykorzystuje protokół mDNS do rozgłaszania domeny serwera w sieciach lokalnych.
### Instalacja i uruchomienie 
 1. Sklonuj repozytorium na dysk swojego komputera.
 2. Zainstaluj dodatkowe biblioteki `npm i` (rekomendowane node.js v18)
 3. Zmień ustawienia serwera w pliku `.env` (opcjonalne)
 4. Uruchom serwer za pomocą polecenia `npm start`
 5. Otwórz przeglądarkę i wpisz adres IP lub nazwę domeny (domyślnie: [milionerzy.local](http://milionerzy.local))

## EN
Web browser quiz game modeled on "Who wants to be a millionaire" TV show.
Project has been created in node.js environment with the SQLite database and WebSocket protocol for client-server line communication. The application uses mDNS service to broadcast server domain in local networks.

### Installation
 1. Clone repository to your drive.
 2. Install additional packages `npm i` (node.js v18 recommended)
 3. Change server settings in `.env` file (optional)
 4. Run server by `npm start` command.
 5. Open web browser and type your local IP address or domain name (default: [milionerzy.local](http://milionerzy.local))

 #### Screenshot
 ![screenshot](https://repository-images.githubusercontent.com/559656274/14154eb0-e187-41b4-aa12-52a8678d95b9)