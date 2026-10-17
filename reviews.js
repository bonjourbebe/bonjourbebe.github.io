// Opinie rodziców z Google — wklej tutaj prawdziwe opinie (kopiuj z profilu żłobka w Google).
// Na stronie pokazują się tylko opinie z oceną 5. Czas wyświetlania każdej opinii liczy się sam,
// na podstawie jej długości (ok. 200 słów na minutę, od 5 do 16 sekund).
//
// Format jednej opinii:
//   { rating: 5, author: "Imię i pierwsza litera nazwiska", date: "2025-09", text: "Treść opinii" }
//
// Poniższe trzy wpisy to PRZYKŁADY o różnej długości (krótka, średnia, długa),
// żeby było widać działanie karuzeli. Zastąp je prawdziwymi opiniami.
window.BB_REVIEWS = [
  {
    rating: 5,
    author: "Przykład: krótka opinia",
    date: "",
    text: "Tu pojawi się krótka opinia rodzica z Google. Krótki tekst zmienia się szybciej."
  },
  {
    rating: 5,
    author: "Przykład: średnia opinia",
    date: "",
    text: "Tu pojawi się opinia średniej długości. Karuzela sama wylicza, ile czasu potrzeba na jej przeczytanie, i dopiero wtedy przechodzi do następnej. Pasek pod spodem pokazuje, ile czasu zostało."
  },
  {
    rating: 5,
    author: "Przykład: długa opinia",
    date: "",
    text: "Tu pojawi się dłuższa opinia rodzica. Takie opinie zostają na ekranie dłużej, żeby każdy zdążył je spokojnie przeczytać. Najechanie kursorem albo dotknięcie karty zatrzymuje przewijanie, a strzałki pozwalają przejść do poprzedniej lub następnej opinii. Osoby, które w ustawieniach urządzenia ograniczyły animacje, przełączają opinie samodzielnie."
  },
  {
    rating: 4,
    author: "Przykład: opinia 4-gwiazdkowa",
    date: "",
    text: "Ta opinia ma 4 gwiazdki, więc nie pojawi się na stronie."
  }
];
