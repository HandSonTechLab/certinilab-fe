import {Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportService} from '../../services/report.service';
import {ReportVenditeDTO} from '../../model/report-vendite.model';

type TipoPeriodo = 'giornaliero' | 'mensile';

const CATEGORIA_LABELS: Record<string, string> = {
  ANIMALI: 'Animali',
  MANGIME: 'Mangime',
  SCATOLE: 'Scatole',
};

@Component({
  selector: 'app-report',
  imports: [CommonModule],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  private service = inject(ReportService);

  protected readonly categoriaLabels = CATEGORIA_LABELS;

  protected tipoPeriodo = signal<TipoPeriodo>('giornaliero');
  protected data = signal<string>(this.today());
  protected mese = signal<string>(this.currentMonth());
  protected report = signal<ReportVenditeDTO | null>(null);
  protected loading = signal<boolean>(false);
  protected hasSearched = signal<boolean>(false);

  ngOnInit(): void {
    this.generaReport();
  }

  selezionaTipo(tipo: TipoPeriodo): void {
    if (this.tipoPeriodo() === tipo) {
      return;
    }
    this.tipoPeriodo.set(tipo);
  }

  onDataChange(value: string): void {
    this.data.set(value);
  }

  onMeseChange(value: string): void {
    this.mese.set(value);
  }

  generaReport(): void {
    this.loading.set(true);
    const request$ = this.tipoPeriodo() === 'giornaliero'
      ? this.service.getReportGiornaliero(this.data())
      : this.service.getReportMensile(this.mese());

    request$.subscribe({
      next: (response) => {
        this.report.set(response.body ?? null);
        this.loading.set(false);
        this.hasSearched.set(true);
      },
      error: () => {
        this.report.set(null);
        this.loading.set(false);
        this.hasSearched.set(true);
      },
    });
  }

  private today(): string {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private currentMonth(): string {
    const d = new Date();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  }
}
