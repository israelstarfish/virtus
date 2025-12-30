//frontend/src/components/Recycles/Dashboard/UsageBar.jsx

import React from "react";

export default function UsageBar({ usedMB, totalMB }) {
    const percentUsed = (usedMB / totalMB) * 100;

    // lógica da cor
    let barColor = "green";
    if (percentUsed >= 80) {
        barColor = "red";
    } else if (percentUsed >= 50) {
        barColor = "yellow";
    }

    return (
        <div className="w-full rounded-md border border-virtus-600 px-2.5 lg:w-88" style={{ opacity: 1 }}>
            <div className="flex h-10 shrink-0 flex-col justify-center gap-0.5">
                {/* ✅ Global: uso do plano */}
                <p className="flex justify-between gap-4 text-nowrap leading-none">
                    <span className="text-muted text-xs">{usedMB} MB usado</span>
                    <span className="text-nowrap text-muted text-xs">
                        {totalMB - usedMB} MB disponível de {totalMB} MB
                    </span>
                </p>

                {/* Barra de uso com cor dinâmica */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full">
                    {(() => {
                        const percentUsed = (usedMB / totalMB) * 100;

                        // só amarelo até 79.99%, vermelho a partir de 80%
                        let barColor = "rgb(229, 212, 93)"; // amarelo
                        if (percentUsed >= 80) {
                            barColor = "rgb(220, 38, 38)"; // vermelho (tailwind red-600)
                        }

                        return (
                            <div
                                className="absolute inset-0 h-full rounded-full"
                                style={{
                                    backgroundColor: barColor,
                                    width: `${percentUsed}%`,
                                    transition: "width 0.3s ease, background-color 0.3s ease",
                                }}
                            />
                        );
                    })()}
                    <div className="size-full rounded-full bg-virtus-400/30" />
                </div>
            </div>
        </div>
    );
}