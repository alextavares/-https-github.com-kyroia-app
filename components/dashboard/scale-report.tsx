"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Target, TrendingUp, Zap } from "lucide-react"

interface BodyCompositionData {
  weight: number
  bodyFat: number
  muscleMass: number
  visceralFat: number
  bmi: number
  bmr: number
  segmentalData: {
    leftArm: { fat: number; muscle: number }
    rightArm: { fat: number; muscle: number }
    trunk: { fat: number; muscle: number }
    leftLeg: { fat: number; muscle: number }
    rightLeg: { fat: number; muscle: number }
  }
}

interface ScaleReportProps {
  data: BodyCompositionData
  className?: string
}

export function ScaleReport({ data, className }: ScaleReportProps) {
  const getFatColor = (percentage: number) => {
    if (percentage < 18) return "text-green-500"
    if (percentage < 25) return "text-yellow-500"
    return "text-red-500"
  }

  const getMuscleColor = (percentage: number) => {
    if (percentage > 40) return "text-green-500"
    if (percentage > 30) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Relatório de Composição Corporal
          </CardTitle>
          <CardDescription>
            Análise detalhada da sua composição corporal baseada nos dados da balança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="segmental">Análise Segmentar</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Peso</span>
                    </div>
                    <div className="text-2xl font-bold">{data.weight}kg</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">% Gordura</span>
                    </div>
                    <div className={`text-2xl font-bold ${getFatColor(data.bodyFat)}`}>
                      {data.bodyFat}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Músculo</span>
                    </div>
                    <div className={`text-2xl font-bold ${getMuscleColor(data.muscleMass)}`}>
                      {data.muscleMass}kg
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">IMC</span>
                    </div>
                    <div className="text-2xl font-bold">{data.bmi}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>% Gordura Corporal</span>
                    <span>{data.bodyFat}%</span>
                  </div>
                  <Progress value={data.bodyFat} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Massa Muscular</span>
                    <span>{data.muscleMass}kg</span>
                  </div>
                  <Progress value={(data.muscleMass / data.weight) * 100} className="h-2" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="segmental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise Segmentar de Gordura & Equilíbrio Muscular</CardTitle>
                  <CardDescription>
                    Distribuição de gordura e massa muscular por segmentos do corpo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Human Silhouette */}
                    <div className="relative">
                      <img
                        src="/human-silhouette.svg"
                        alt="Silhueta Humana"
                        className="w-48 h-auto"
                      />

                      {/* Data Labels */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Left Arm */}
                        <div className="absolute top-1/4 left-2 text-xs bg-white/90 px-1 py-0.5 rounded shadow-sm">
                          <div className="text-red-500 font-semibold">{data.segmentalData.leftArm.fat}%</div>
                          <div className="text-green-500 text-[10px]">{data.segmentalData.leftArm.muscle}kg</div>
                        </div>

                        {/* Right Arm */}
                        <div className="absolute top-1/4 right-2 text-xs bg-white/90 px-1 py-0.5 rounded shadow-sm">
                          <div className="text-red-500 font-semibold">{data.segmentalData.rightArm.fat}%</div>
                          <div className="text-green-500 text-[10px]">{data.segmentalData.rightArm.muscle}kg</div>
                        </div>

                        {/* Trunk */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs bg-white/90 px-1 py-0.5 rounded shadow-sm">
                          <div className="text-red-500 font-semibold">{data.segmentalData.trunk.fat}%</div>
                          <div className="text-green-500 text-[10px]">{data.segmentalData.trunk.muscle}kg</div>
                        </div>

                        {/* Left Leg */}
                        <div className="absolute bottom-1/4 left-8 text-xs bg-white/90 px-1 py-0.5 rounded shadow-sm">
                          <div className="text-red-500 font-semibold">{data.segmentalData.leftLeg.fat}%</div>
                          <div className="text-green-500 text-[10px]">{data.segmentalData.leftLeg.muscle}kg</div>
                        </div>

                        {/* Right Leg */}
                        <div className="absolute bottom-1/4 right-8 text-xs bg-white/90 px-1 py-0.5 rounded shadow-sm">
                          <div className="text-red-500 font-semibold">{data.segmentalData.rightLeg.fat}%</div>
                          <div className="text-green-500 text-[10px]">{data.segmentalData.rightLeg.muscle}kg</div>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Gordura Corporal (%)
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Braço Esquerdo:</span>
                              <span className="font-semibold">{data.segmentalData.leftArm.fat}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Braço Direito:</span>
                              <span className="font-semibold">{data.segmentalData.rightArm.fat}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tronco:</span>
                              <span className="font-semibold">{data.segmentalData.trunk.fat}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Perna Esquerda:</span>
                              <span className="font-semibold">{data.segmentalData.leftLeg.fat}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Perna Direita:</span>
                              <span className="font-semibold">{data.segmentalData.rightLeg.fat}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Massa Muscular (kg)
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Braço Esquerdo:</span>
                              <span className="font-semibold">{data.segmentalData.leftArm.muscle}kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Braço Direito:</span>
                              <span className="font-semibold">{data.segmentalData.rightArm.muscle}kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tronco:</span>
                              <span className="font-semibold">{data.segmentalData.trunk.muscle}kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Perna Esquerda:</span>
                              <span className="font-semibold">{data.segmentalData.leftLeg.muscle}kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Perna Direita:</span>
                              <span className="font-semibold">{data.segmentalData.rightLeg.muscle}kg</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Balance Analysis */}
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-sm mb-2">Análise de Equilíbrio</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Equilíbrio Braços:</span>
                            <Badge variant={
                              Math.abs(data.segmentalData.leftArm.muscle - data.segmentalData.rightArm.muscle) < 0.5
                                ? "default"
                                : "destructive"
                            }>
                              {Math.abs(data.segmentalData.leftArm.muscle - data.segmentalData.rightArm.muscle) < 0.5
                                ? "Equilibrado"
                                : "Desequilibrado"}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Equilíbrio Pernas:</span>
                            <Badge variant={
                              Math.abs(data.segmentalData.leftLeg.muscle - data.segmentalData.rightLeg.muscle) < 1
                                ? "default"
                                : "destructive"
                            }>
                              {Math.abs(data.segmentalData.leftLeg.muscle - data.segmentalData.rightLeg.muscle) < 1
                                ? "Equilibrado"
                                : "Desequilibrado"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tendências e Metas</CardTitle>
                  <CardDescription>
                    Acompanhe seu progresso e defina novas metas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">Meta de Peso</span>
                          </div>
                          <div className="text-2xl font-bold">75kg</div>
                          <div className="text-xs text-muted-foreground">
                            Meta atual: Perder 5kg
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-sm">Meta de Músculo</span>
                          </div>
                          <div className="text-2xl font-bold">42kg</div>
                          <div className="text-xs text-muted-foreground">
                            Meta atual: Ganhar 2kg
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Recomendações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Continue com exercícios de força 3x por semana para ganho muscular</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Mantenha déficit calórico de 300-500 kcal/dia para perda de gordura</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>Considere exercícios unilaterais para melhorar equilíbrio muscular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}