const borderPlugin = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
        const {
            ctx,
            chartArea: { left, top, width, height },
        } = chart;
        if (chart.options.plugins.zoom.zoom.wheel.enabled) {
            ctx.save();
            ctx.strokeStyle = '#FFFFFF';
            ctx.setLineDash([5, 10]);
            ctx.lineDashOffset = 2;
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, width, height);
            ctx.restore();
        }
    },
};

module.exports = borderPlugin;

// If used in browser, register globally
if (window.Chart) {
    window.Chart.register(borderPlugin);
}
