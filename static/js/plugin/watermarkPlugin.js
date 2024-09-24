/**
 * Chart.js Simple Watermark plugin
 *
 * Valid options:
 *
 * options: {
 *      watermark: {
 *          // required
 *          image: new Image(),
 *
 *          x: 0,
 *          y: 0,
 *
 *          width: 0,
 *          height: 0,
 *
 *          alignX: "left"/"right"/"middle",
 *          alignY: "top"/"bottom"/"middle",
 *
 *          position: "front"/"back/between",
 *
 *          opacity: 0 to 1, // uses ctx.globalAlpha
 *      }
 * }
 *
 * Created by Sean on 12/19/2016.
 */
const watermarkPlugin = {
    id: 'watermark',

    defaultOptions: {
        x: 0,
        y: 0,

        height: false,
        width: false,

        alignX: 'top',
        alignY: 'left',
        alignToChartArea: false,

        position: 'front',

        opacity: 1,

        image: false,
        text: false,
    },

    isPercentage: function (value) {
        return typeof value == 'string' && value.charAt(value.length - 1) === '%';
    },

    calcPercentage: function (percentage, max) {
        var value = percentage.substr(0, percentage.length - 1);
        value = parseFloat(value);

        return max * (value / 100);
    },

    autoPercentage: function (value, maxIfPercentage) {
        if (this.isPercentage(value)) {
            value = this.calcPercentage(value, maxIfPercentage);
        }

        return value;
    },

    imageFromString: function (imageSrc) {
        // create the image object with this as our src
        var imageObj = new Image();
        imageObj.src = imageSrc;

        return imageObj;
    },

    drawWatermark: function (chartInstance, position) {
        const watermark = chartInstance.watermark;

        // only draw watermarks meant for us
        if (watermark.position !== position) {
            return;
        }

        const context = chartInstance.ctx;
        const canvas = context.canvas;

        let cHeight, cWidth;
        let offsetX = 0,
            offsetY = 0;

        if (watermark.alignToChartArea) {
            const chartArea = chartInstance.chartArea;

            cHeight = chartArea.bottom - chartArea.top;
            cWidth = chartArea.right - chartArea.left;

            offsetX = chartArea.left;
            offsetY = chartArea.top;
        } else {
            cHeight = canvas.clientHeight || canvas.height;
            cWidth = canvas.clientWidth || canvas.width;
        }

        const image = watermark.image;

        let height = watermark.height || image?.height;
        height = this.autoPercentage(height, cHeight);

        let width = watermark.width || image?.width;
        width = this.autoPercentage(width, cWidth);

        let x = this.autoPercentage(watermark.x, cWidth);
        let y = this.autoPercentage(watermark.y, cHeight);

        switch (watermark.alignX) {
            case 'right':
                x = cWidth - x - width;
                break;
            case 'middle':
                x = cWidth / 2 - width / 2 - x;
                break;
            default:
        }

        switch (watermark.alignY) {
            case 'bottom':
                y = cHeight - y - height;
                break;
            case 'middle':
                y = cHeight / 2 - height / 2 - y;
                break;
            default:
        }

        context.save();

        context.globalAlpha = watermark.opacity;
        if (image) {
            context.drawImage(image, offsetX + x, offsetY + y, width, height);
        } else if (chartInstance?.options?.watermark?.text) {
            chartInstance?.options?.watermark?.color &&
                (context.fillStyle = chartInstance.options.watermark.color);
            context.fillText(chartInstance.options.watermark.text, offsetX + x, offsetY + y, width);
        }

        context.restore();
    },

    beforeInit: function (chartInstance) {
        chartInstance.watermark = {};

        var options = chartInstance.options;

        if (options.watermark) {
            const clonedDefaultOptions = Object.assign({}, this.defaultOptions);
            const watermark = Object.assign(clonedDefaultOptions, options.watermark);

            if (watermark.image) {
                let image = watermark.image;

                if (typeof image == 'string') {
                    image = this.imageFromString(image);
                }

                // automatically refresh the chart once the image has loaded (if necessary)
                image.onload = function () {
                    if (chartInstance.ctx) {
                        chartInstance.update();
                    }
                };

                watermark.image = image;
            }

            chartInstance.watermark = watermark;
        }
    },

    // draw the image behind most chart elements
    beforeDraw: function (chartInstance) {
        this.drawWatermark(chartInstance, 'back');
    },
    // draw the image in front of most chart elements
    afterDraw: function (chartInstance) {
        this.drawWatermark(chartInstance, 'front');
    },
    // draw the image in front of chart elements, but before tooltips
    afterDatasetsDraw: function (chartInstance) {
        this.drawWatermark(chartInstance, 'between');
    },
};

module.exports = watermarkPlugin;

// If used in browser, register globally
if (window.Chart) {
    window.Chart.register(watermarkPlugin);
}
