import { Component, OnInit } from '@angular/core';
import { Match } from 'src/app/models/match.model';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  matches: Match[] = [];

  constructor(private leagueService: LeagueService) { }

  ngOnInit(): void {
    this.leagueService.getAllMatches().subscribe((data) => {
      this.matches = data;
    });
  }
}
