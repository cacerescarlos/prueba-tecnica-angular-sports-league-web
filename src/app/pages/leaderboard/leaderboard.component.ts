import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../../../../src/app/models/leaderboard.model';
import { LeagueService } from '../../../../src/app/services/league.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  leaderboard: LeaderboardEntry[] = [];

  constructor(private leagueService: LeagueService) { }

  ngOnInit(): void {
    this.leagueService.getMatches().subscribe((match) => {
      this.leagueService.setMatches(match);
      this.leaderboard = this.leagueService.getLeaderBoard();
    });
  }
}
