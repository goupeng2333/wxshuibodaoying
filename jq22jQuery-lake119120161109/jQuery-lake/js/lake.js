(function($) {
    jQuery.fn.lake = function(options) {
        var settings = $.extend({
            'speed':    1,
            'scale':    1,
            'waves':    10,
            'image':    true
        }, options);

        var waves = settings['waves'];
        var speed = settings['speed']/4;
        var scale = settings['scale']/2;

        // 在DOM中创建画布canvas
        var ca = document.createElement('canvas');

        // 创建 context 对象
        var c = ca.getContext('2d');

        var img = this.get(0);
        var img_loaded = false;

        // 将canvas元素插入图像前面
        img.parentNode.insertBefore(ca, img);

        var w, h, dw, dh;

        var offset = 0;
        var frame = 0;
        var max_frames = 0;
        var frames = [];

        img.onload = function() {
            //保存当前环境的状态
            c.save();

            c.canvas.width  = this.width;
            c.canvas.height = this.height*2;

            // this指img图片，drawImage,将图片的像素绘制到画布中 
            //context.drawImage(img,x,y);
            c.drawImage(this, 0,  0);

            // 图片缩放 context.scale(scalewidth,scaleheight);
            // scaleheight 设置为-1表示反转
            c.scale(1, -1);
            c.drawImage(this, 0,  -this.height*2);

            img_loaded = true;

            //返回之前保存过的路径状态和属性
            c.restore();

            w = c.canvas.width;
            h = c.canvas.height;
            dw = w;
            dh = h/2;

            // 返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据
            // context.getImageData(x,y,width,height);
            var id = c.getImageData(0, h/2, w, h).data; // 获取倒影图像像素
            var end = false;

            // precalc frames
            // image displacement

            //保存当前环境的状态
            c.save();
            while (!end) {
                // var odd = c.createImageData(dw, dh);
                // 为什么要重新获取新的像素矩阵呢，
                //在while循环中从未putImageData过
                // 如果不重新getImageData的话每次计算结果都一样
                var odd = c.getImageData(0, h/2, w, h);// 获取倒影部分ImageData对象
                var od = odd.data;//像素矩阵
                //console.log('KKKKKKKK');
                console.log(od);
                // var pixel = (w*4) * 5;
                var pixel = 0;

                // 计算水波像素值
                for (var y = 0; y < dh; y++) {
                    for (var x = 0; x < dw; x++) {
                        // var displacement = (scale * dd[pixel]) | 0;
                        var displacement = (scale * 10 * (Math.sin((dh/(y/waves)) + (-offset)))) | 0;
                        var j = ((displacement + y) * w + x + displacement)*4;

                        // horizon flickering fix
                        if (j < 0) {
                            pixel += 4;
                            continue;
                        }

                        // edge wrapping fix
                        var m = j % (w*4);
                        var n = scale * 10 * (y/waves);

                        if (m < n || m > (w*4)-n) {
                            var sign = y < w/2 ? 1 : -1;
                            od[pixel]   = od[pixel + 4 * sign];
                            od[++pixel] = od[pixel + 4 * sign];
                            od[++pixel] = od[pixel + 4 * sign];
                            od[++pixel] = od[pixel + 4 * sign];
                            ++pixel;
                            continue;
                        }

                        if (id[j+3] != 0) {
                            od[pixel]   = id[j];
                            od[++pixel] = id[++j];
                            od[++pixel] = id[++j];
                            od[++pixel] = id[++j];
                            ++pixel;
                        } else {
                            od[pixel]   = od[pixel - w*4];
                            od[++pixel] = od[pixel - w*4];
                            od[++pixel] = od[pixel - w*4];
                            od[++pixel] = od[pixel - w*4];
                            ++pixel;
                            // pixel += 4;
                        }
                    }
                }

                if (offset > speed * (6/speed)) {
                    offset = 0;
                    max_frames = frame - 1;
                    // frames.pop();
                    frame = 0;
                    end = true;
                } else {
                    offset += speed;
                    frame++;
                }
                frames.push(odd);
            }

            /*console.log('JJJJJJJJJJ');
            for(var y = 0; y < frames.length; y++){
                console.log(frames[y].data);
            }
            console.log('KKKKKKKKKKK');*/
            c.restore();
            if (!settings.image) {
                c.height = c.height/2;
            }
            console.log('计算结束');
        };
        


        setInterval(function() {
            if (img_loaded) {
                if (!settings.image) {
                    c.putImageData(frames[frame], 0, 0);
                } else {
                    c.putImageData(frames[frame], 0, h/2);
                }
                // c.putImageData(frames[frame], 0, h/2);
                if (frame < max_frames) {
                    frame++;
                } else {
                    frame = 0;
                }
            }
        }, 17);
        return this;
    }
})(jQuery);
