import { Award, BarChart2, TicketCheck, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { t } from "@/lib/i18n";
import { RevenueOverviewChart } from "./revenue-overview-chart";

export function OverviewTab() {
    return (
        <div className="space-y-6"> 
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="tagline-3">
                            Total Franchises
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="numbers text-2xl font-bold">245</div>
                        <p className="legal text-muted-foreground">
                            +4 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="tagline-3">
                            Monthly Revenue
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="numbers text-2xl font-bold">€2.4M</div>
                        <p className="legal text-muted-foreground">
                            +12.3% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="tagline-3">
                            Top Performers
                        </CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="numbers text-2xl font-bold">32</div>
                        <p className="legal text-muted-foreground">
                            Exceeded targets this quarter
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="tagline-3">
                            Active Support Tickets
                        </CardTitle>
                        <TicketCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="numbers text-2xl font-bold">18</div>
                        <p className="legal text-muted-foreground">
                            85% resolution rate
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="tagline-2">{t('revenueOverview')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="] flex items-center justify-center border-2 border-dashed border-muted">
                            {/* <BarChart2 className="h-8 w-8 text-muted-foreground" /> */}
                            <RevenueOverviewChart></RevenueOverviewChart>
                        </div>
                    </CardContent>
                </Card>


                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="tagline-2">Top Performing Regions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"].map(
                                (region) => (
                                    <div
                                        key={region}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="body-1">{region}</span>
                                        <span className="numbers text-muted-foreground">
                                            €{Math.floor(Math.random() * 900000 + 100000)}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}