import { format } from "d3-format";
import * as React from "react";
import { Chart, ChartCanvas } from "react-financial-charts";
import { XAxis, YAxis } from "react-financial-charts/lib/axes";
import { atr } from "react-financial-charts/lib/indicator";
import { discontinuousTimeScaleProviderBuilder } from "react-financial-charts/lib/scale";
import { LineSeries } from "react-financial-charts/lib/series";
import { SingleValueTooltip } from "react-financial-charts/lib/tooltip";
import { withDeviceRatio } from "react-financial-charts/lib/utils";
import { IOHLCData, withOHLCData, withSize } from "../../data";

interface ChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly width: number;
    readonly ratio: number;
}

class ATRIndicator extends React.Component<ChartProps> {

    private readonly margin = { left: 0, right: 40, top: 0, bottom: 24 };
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder()
        .inputDateAccessor((d: IOHLCData) => d.date);

    public render() {

        const {
            data: initialData,
            height,
            ratio,
            width,
        } = this.props;

        const atr14 = atr()
            // @ts-ignore
            .options({ windowSize: 14 })
            .merge((d: any, c: any) => { d.atr14 = c; })
            .accessor((d: any) => d.atr14);

        const calculatedData = atr14(initialData);

        const { margin, xScaleProvider } = this;

        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);

        const start = xAccessor(data[data.length - 1]);
        const end = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [start, end];

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}>
                <Chart
                    id={1}
                    yExtents={atr14.accessor()}>
                    <XAxis ticks={6} />
                    <YAxis ticks={2} />

                    <LineSeries yAccessor={atr14.accessor()} stroke={atr14.stroke()} />

                    <SingleValueTooltip
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format(".2f")}
                        labelFill={atr14.stroke()}
                        origin={[8, 16]} />
                </Chart>
            </ChartCanvas>
        );
    }
}

export default withOHLCData()(withSize()(withDeviceRatio()(ATRIndicator)));
