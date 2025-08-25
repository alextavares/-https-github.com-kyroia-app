import { ScaleReport } from '@/components/dashboard/scale-report'

// Sample data - in a real app, this would come from an API or database
const sampleData = {
  weight: 80.5,
  bodyFat: 22.3,
  muscleMass: 40.2,
  visceralFat: 8.1,
  bmi: 24.8,
  bmr: 1850,
  segmentalData: {
    leftArm: { fat: 18.5, muscle: 4.2 },
    rightArm: { fat: 19.2, muscle: 4.1 },
    trunk: { fat: 25.1, muscle: 24.8 },
    leftLeg: { fat: 21.8, muscle: 8.6 },
    rightLeg: { fat: 22.4, muscle: 8.5 }
  }
}

export default function ScaleReportPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Relatório da Balança</h1>
        <p className="text-muted-foreground">
          Análise detalhada da sua composição corporal
        </p>
      </div>

      <ScaleReport data={sampleData} />
    </div>
  )
}