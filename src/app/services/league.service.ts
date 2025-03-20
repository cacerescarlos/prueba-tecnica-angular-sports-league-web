/**
 * A class representing a service that processes the data for match schedule
 * and generates leaderboard.
 * 
 * NOTE: MAKE SURE TO IMPLEMENT ALL EXISITNG METHODS BELOW WITHOUT CHANGING THE INTERFACE OF THEM, 
 *       AND PLEASE DO NOT RENAME, MOVE OR DELETE THIS FILE.  
 * 
 */

import { Injectable } from '@angular/core'
import { Match } from '../models/match.model';
import { LeaderboardEntry } from '../models/leaderboard.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LeagueService {
  private apiUrl = environment.apiUrl;
  private accessToken: string | null = null;
  matchesData: Match[] = [];

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    });
  }

  /**
 * Obtiene el token de acceso desde la API y lo almacena en `accessToken`
 */
  getAccessToken(): Observable<{ success: boolean; access_token: string }> {
    return this.http.get<{ success: boolean; access_token: string }>(`${this.apiUrl}/getAccessToken`).pipe(
      tap(response => {
        this.accessToken = response.access_token;
      })
    );
  }

  /**
   * Sets the match schedule.
   * Match schedule will be given in the following form:
   * [
   *      {
   *          matchDate: [TIMESTAMP],
   *          stadium: [STRING],
   *          homeTeam: [STRING],
   *          awayTeam: [STRING],
   *          matchPlayed: [BOOLEAN],
   *          homeTeamScore: [INTEGER],
   *          awayTeamScore: [INTEGER]
   *      },
   *      {
   *          matchDate: [TIMESTAMP],
   *          stadium: [STRING],
   *          homeTeam: [STRING],
   *          awayTeam: [STRING],
   *          matchPlayed: [BOOLEAN],
   *          homeTeamScore: [INTEGER],
   *          awayTeamScore: [INTEGER]
   *      }
   * ]
   *
   * @param {Array} matches List of matches.
   */

  setMatches(matches: Match[]) {
    this.matchesData = matches;
  }

  /**
   * Returns the full list of matches.
   *
   * @returns {Array} List of matches.
   */
  getMatches(): Observable<Match[]> {
    if (!this.accessToken) {
      return this.getAccessToken().pipe(
        switchMap(() =>
          this.http.get<{ success: boolean; matches: Match[] }>(`${this.apiUrl}/getAllMatches`, { headers: this.getHeaders() })
        ),
        map(response => response.matches) // 🔹 Extrae solo el array de partidos
      );
    }

    return this.http.get<{ success: boolean; matches: Match[] }>(`${this.apiUrl}/getAllMatches`, { headers: this.getHeaders() })
      .pipe(map(response => response.matches)); // 🔹 Extrae solo el array de partidos
  }


  /**
   * Returns the leaderBoard in a form of a list of JSON objecs.
   *
   * [
   *      {
   *          teamName: [STRING]',
   *          matchesPlayed: [INTEGER],
   *          goalsFor: [INTEGER],
   *          goalsAgainst: [INTEGER],
   *          points: [INTEGER]
   *      },
   * ]
   *
   * @returns {Array} List of teams representing the leaderBoard.
   */
  getLeaderBoard(matchs: any): LeaderboardEntry[] {
    const standings: { [team: string]: LeaderboardEntry } = {};

    matchs.forEach(match => {
      const { homeTeam, awayTeam, homeTeamScore, awayTeamScore, matchPlayed } = match;

      if (!standings[homeTeam]) standings[homeTeam] = { teamName: homeTeam, matchesPlayed: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
      if (!standings[awayTeam]) standings[awayTeam] = { teamName: awayTeam, matchesPlayed: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };

      if (matchPlayed) {
        standings[homeTeam].matchesPlayed++;
        standings[awayTeam].matchesPlayed++;

        standings[homeTeam].goalsFor += homeTeamScore;
        standings[homeTeam].goalsAgainst += awayTeamScore;

        standings[awayTeam].goalsFor += awayTeamScore;
        standings[awayTeam].goalsAgainst += homeTeamScore;

        if (homeTeamScore > awayTeamScore) {
          standings[homeTeam].points += 3;
        } else if (homeTeamScore < awayTeamScore) {
          standings[awayTeam].points += 3;
        } else {
          standings[homeTeam].points += 1;
          standings[awayTeam].points += 1;
        }
      }
    });

    return Object.keys(standings).map(team => standings[team]).sort((a, b) =>
      b.points - a.points ||
      (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor ||
      a.teamName.localeCompare(b.teamName)
    );
  }

  /**
   * Asynchronic function to fetch the data from the server and set the matches.
   */
  async fetchData() {
    try {
      await this.getMatches().subscribe(matches => {
        this.setMatches(matches);
      });
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }
}
