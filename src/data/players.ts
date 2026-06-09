/**
 * Sample squads — a representative ~5-player roster per nation so the team page
 * has real content. Stats are mock/illustrative. Replace with the real squad later.
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

const sampleNames: Record<string, string[]> = {
  argentina: ["Emiliano Martínez", "Cristian Romero", "Rodrigo De Paul", "Lionel Messi", "Julián Álvarez"],
  brazil: ["Alisson", "Marquinhos", "Casemiro", "Vinícius Jr.", "Rodrygo"],
  france: ["Mike Maignan", "William Saliba", "Aurélien Tchouaméni", "Kylian Mbappé", "Ousmane Dembélé"],
  germany: ["Manuel Neuer", "Antonio Rüdiger", "Joshua Kimmich", "Jamal Musiala", "Florian Wirtz"],
  england: ["Jordan Pickford", "John Stones", "Declan Rice", "Harry Kane", "Bukayo Saka"],
  portugal: ["Diogo Costa", "Rúben Dias", "Bruno Fernandes", "Cristiano Ronaldo", "Rafael Leão"],
  spain: ["Unai Simón", "Aymeric Laporte", "Rodri", "Lamine Yamal", "Álvaro Morata"],
  netherlands: ["Bart Verbruggen", "Virgil van Dijk", "Frenkie de Jong", "Cody Gakpo", "Memphis Depay"],
  belgium: ["Koen Casteels", "Wout Faes", "Kevin De Bruyne", "Romelu Lukaku", "Jérémy Doku"],
  croatia: ["Dominik Livaković", "Joško Gvardiol", "Luka Modrić", "Andrej Kramarić", "Mateo Kovačić"],
  morocco: ["Yassine Bounou", "Achraf Hakimi", "Sofyan Amrabat", "Hakim Ziyech", "Youssef En-Nesyri"],
  japan: ["Zion Suzuki", "Ko Itakura", "Wataru Endo", "Takefusa Kubo", "Kaoru Mitoma"],
  india: ["Gurpreet Sandhu", "Sandesh Jhingan", "Sahal Abdul Samad", "Sunil Chhetri", "Liston Colaco"],
};

const clubs = ["Real Madrid", "Manchester City", "Barcelona", "Bayern Munich", "PSG", "Arsenal", "Liverpool", "Inter Milan"];

export const PLAYERS_BY_TEAM: Record<string, Player[]> = Object.fromEntries(
  TEAMS.map((t) => {
    const names = sampleNames[t.slug] ?? [
      `${t.code} #1`, `${t.code} #4`, `${t.code} #8`, `${t.code} #10`, `${t.code} #11`,
    ];
    const positions: Position[] = ["GK", "DF", "MF", "FW", "FW"];
    return [
      t.slug,
      names.map((name, i) => ({
        id: `${t.slug}-${i}`,
        name,
        position: positions[i],
        club: clubs[(i * 3 + name.length) % clubs.length],
        goals: i === 3 || i === 4 ? 4 + ((name.length * 3) % 7) : i === 2 ? 2 : 0,
        assists: i === 2 || i === 3 ? 3 + (name.length % 4) : 1,
        appearances: 10 + (name.length % 6),
      })),
    ];
  })
);

export const topScorers = (slug: string): Player[] =>
  [...(PLAYERS_BY_TEAM[slug] ?? [])].sort((a, b) => b.goals - a.goals).slice(0, 3);
