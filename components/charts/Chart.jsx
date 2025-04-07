import { View, ScrollView, Text, TouchableWithoutFeedback } from 'react-native';
import React, { useState } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const Chart = ({ data, width, height, containerStyles }) => {
    const [tooltip, setTooltip] = useState(null)
    if (!data || data.time.length === 0) {
        return (
            <View className="items-center justify-center" style={{ width: width * 0.85, height: height }}>
                <Text style={{ fontSize: height * 0.09 }} className="text-notFullWhite">Loading...</Text>
            </View>
        );
    }

    const pointWidth = 90;
    const chartWidth = Math.max(wp('100%'), data.time.length * pointWidth);

    return (

        <ScrollView horizontal style={[containerStyles, { overflow: 'visible' }]} contentContainerStyle={{ width: chartWidth }} showsHorizontalScrollIndicator={false}>
            <TouchableWithoutFeedback onPress={() => setTooltip(null)} style={{ width: '100%', height: '100%' }}>
                <View>
                    <LineChart
                        data={{
                            labels: data.time,
                            datasets: [
                                {
                                    data: data.temperature,
                                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                                    strokeWidth: 2,
                                },
                                {
                                    data: data.humidity,
                                    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                                    strokeWidth: 2,
                                },
                                {
                                    data: data.brightness,
                                    color: (opacity = 1) => `rgba(255, 255, 0, ${opacity})`,
                                    strokeWidth: 2,
                                },
                                {
                                    data: data.water,
                                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                                    strokeWidth: 2,
                                }
                            ],
                        }}
                        style={{borderRadius:5}}
                        width={chartWidth}
                        height={height}
                        chartConfig={{
                            backgroundGradientFrom: "#f5f5f5",
                            backgroundGradientTo: "#fff",
                            decimalPlaces: 1,
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: { borderRadius: 10 },
                            propsForDots: { r: "4", strokeWidth: "2", stroke: "#007AFF" },
                        }}
                        bezier
                        onDataPointClick={({ index, value, x, y }) => {
                            let unit = "";
                            if (data.humidity.includes(value)) {
                                unit = "%";
                            } 
                            if (data.brightness.includes(value)) {
                                unit = "%";
                            }

                            setTooltip({ x, y, value: `${value}${unit}`, label: data.time[index] });
                        }}
                        formatXLabel={(value) => value.slice(11)}
                    />
                    {tooltip && (
                        <View style={{
                            position: 'absolute',
                            left: tooltip.x - 58,
                            top: tooltip.y - 60,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            padding: 6,
                            borderRadius: 7,
                            alignItems: 'center'
                        }}>
                            <Text style={{ color: 'white', fontSize: 12 }}>{tooltip.label}</Text>
                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{tooltip.value}</Text>
                        </View>

                    )}
                </View>
            </TouchableWithoutFeedback>
        </ScrollView >  

    );
};

export default Chart;
