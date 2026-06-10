/**
 * Squads — 23-player roster per nation (FIFA World Cup squad size).
 * Known names are used for marquee teams; remaining slots and unknown teams
 * are filled with realistic positional placeholders. Stats are mock/illustrative.
 *
 * // Future API integration point: replace this generated map with the response
 * // from /v1/teams/:slug/squad and wire real player.photoUrl when available.
 */
import { TEAMS } from "./teams";

export type Position = "GK" | "DF" | "MF" | "FW";

export interface Player {
  id: string;
  name: string;
  position: Position;
  club: string;
  goals: number;
  assists: number;
  appearances: number;
}

/** Marquee names per team (front-loaded). Remaining slots auto-fill. */
const sampleNames: Record<string, string[]> = {
  argentina: ["Emiliano Martínez", "Gerónimo Rulli", "Cristian Romero", "Nicolás Otamendi", "Lisandro Martínez", "Nahuel Molina", "Marcos Acuña", "Rodrigo De Paul", "Enzo Fernández", "Alexis Mac Allister", "Leandro Paredes", "Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María"],
  brazil: ["Alisson", "Ederson", "Marquinhos", "Thiago Silva", "Éder Militão", "Danilo", "Casemiro", "Bruno Guimarães", "Lucas Paquetá", "Vinícius Jr.", "Rodrygo", "Raphinha", "Neymar", "Richarlison", "Gabriel Jesus"],
  france: ["Mike Maignan", "Alphonse Areola", "William Saliba", "Dayot Upamecano", "Jules Koundé", "Theo Hernández", "Aurélien Tchouaméni", "Eduardo Camavinga", "Adrien Rabiot", "Antoine Griezmann", "Kylian Mbappé", "Ousmane Dembélé", "Marcus Thuram", "Randal Kolo Muani"],
  germany: ["Manuel Neuer", "Marc-André ter Stegen", "Antonio Rüdiger", "Jonathan Tah", "Joshua Kimmich", "Pascal Groß", "İlkay Gündoğan", "Toni Kroos", "Jamal Musiala", "Florian Wirtz", "Leroy Sané", "Kai Havertz", "Niclas Füllkrug"],
  england: ["Jordan Pickford", "Aaron Ramsdale", "John Stones", "Harry Maguire", "Kyle Walker", "Luke Shaw", "Declan Rice", "Jude Bellingham", "Phil Foden", "Harry Kane", "Bukayo Saka", "Marcus Rashford", "Cole Palmer"],
  portugal: ["Diogo Costa", "Rui Patrício", "Rúben Dias", "Pepe", "João Cancelo", "Nuno Mendes", "Bernardo Silva", "Bruno Fernandes", "Vitinha", "João Félix", "Cristiano Ronaldo", "Rafael Leão", "Diogo Jota"],
  spain: ["Unai Simón", "David Raya", "Aymeric Laporte", "Robin Le Normand", "Dani Carvajal", "Marc Cucurella", "Rodri", "Pedri", "Fabián Ruiz", "Lamine Yamal", "Nico Williams", "Álvaro Morata", "Mikel Oyarzabal"],
  netherlands: ["Bart Verbruggen", "Justin Bijlow", "Virgil van Dijk", "Stefan de Vrij", "Denzel Dumfries", "Nathan Aké", "Frenkie de Jong", "Tijjani Reijnders", "Xavi Simons", "Cody Gakpo", "Memphis Depay", "Wout Weghorst"],
  belgium: ["Koen Casteels", "Matz Sels", "Wout Faes", "Jan Vertonghen", "Timothy Castagne", "Arthur Theate", "Kevin De Bruyne", "Youri Tielemans", "Amadou Onana", "Romelu Lukaku", "Jérémy Doku", "Leandro Trossard"],
  croatia: ["Dominik Livaković", "Ivica Ivušić", "Joško Gvardiol", "Joško Sutalo", "Domagoj Vida", "Borna Sosa", "Luka Modrić", "Mateo Kovačić", "Marcelo Brozović", "Andrej Kramarić", "Ivan Perišić", "Bruno Petković"],
  morocco: ["Yassine Bounou", "Munir Mohamedi", "Achraf Hakimi", "Romain Saïss", "Nayef Aguerd", "Noussair Mazraoui", "Sofyan Amrabat", "Azzedine Ounahi", "Selim Amallah", "Hakim Ziyech", "Youssef En-Nesyri", "Sofiane Boufal"],
  japan: ["Zion Suzuki", "Daniel Schmidt", "Ko Itakura", "Shogo Taniguchi", "Hiroki Ito", "Takehiro Tomiyasu", "Wataru Endo", "Hidemasa Morita", "Daichi Kamada", "Takefusa Kubo", "Kaoru Mitoma", "Ritsu Doan", "Ayase Ueda"],
  india: ["Gurpreet Singh Sandhu", "Amrinder Singh", "Sandesh Jhingan", "Anwar Ali", "Akash Mishra", "Rahul Bheke", "Anirudh Thapa", "Suresh Singh", "Brandon Fernandes", "Sahal Abdul Samad", "Sunil Chhetri", "Liston Colaco", "Manvir Singh", "Ishan Pandita"],
};

const clubs = [
  "Real Madrid", "Manchester City", "Barcelona", "Bayern Munich", "PSG",
  "Arsenal", "Liverpool", "Inter Milan", "Atlético Madrid", "Juventus",
  "Chelsea", "Tottenham", "Borussia Dortmund", "AC Milan", "Napoli",
];

/** Canonical 23-man squad shape: 3 GK, 8 DF, 8 MF, 4 FW. */
const SQUAD_POSITIONS: Position[] = [
  "GK", "GK", "GK",
  "DF", "DF", "DF", "DF", "DF", "DF", "DF", "DF",
  "MF", "MF", "MF", "MF", "MF", "MF", "MF", "MF",
  "FW", "FW", "FW", "FW",
];

export const PLAYERS_BY_TEAM: Record<string, Player[]> = Object.fromEntries(
  TEAMS.map((t) => {
    const known = sampleNames[t.slug] ?? [];
    const names = SQUAD_POSITIONS.map((pos, i) =>
      known[i] ?? `${t.code} ${pos} ${String(i + 1).padStart(2, "0")}`
    );
    return [
      t.slug,
      names.map((name, i) => {
        const pos = SQUAD_POSITIONS[i];
        const seed = name.length + i;
        return {
          id: `${t.slug}-${i}`,
          name,
          position: pos,
          club: clubs[(i * 3 + seed) % clubs.length],
          goals: pos === "FW" ? 3 + (seed % 8) : pos === "MF" ? seed % 4 : 0,
          assists: pos === "MF" || pos === "FW" ? 1 + (seed % 5) : 0,
          appearances: 8 + (seed % 12),
        };
      }),
    ];
  })
);

export const topScorers = (slug: string): Player[] =>
  [...(PLAYERS_BY_TEAM[slug] ?? [])].sort((a, b) => b.goals - a.goals).slice(0, 3);
