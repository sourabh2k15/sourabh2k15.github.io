function otsu(histogram, pixelsNumber) {
	var sum = 0
	  , sumB = 0
	  , wB = 0
	  , wF = 0
      , mB
	  , mF
	  , max = 0
	  , between
	  , threshold = 0;
	for (var i = 0; i < 256; ++i) {
      wB += histogram[i];
      if (wB == 0)
        continue;
      wF = pixelsNumber - wB;
      if (wF == 0)
        break;
      sumB += i * histogram[i];
      mB = sumB / wB;
      mF = (sum - sumB) / wF;
      between = wB * wF * Math.pow(mB - mF, 2);
      if (between > max) {
        max = between;
        threshold = i;
      }
    }
    return threshold;
}

// To test: open any image in browser and run code in console
var im = document.getElementsByTagName('img')[0]
  , cnv = document.createElement('canvas')
  , ctx = cnv.getContext('2d');
cnv.width = im.width;
cnv.height = im.height;
ctx.drawImage(im, 0, 0);
var imData = ctx.getImageData(0, 0, cnv.width, cnv.height)
  , histogram = Array(256)
  , i
  , red
  , green
  , blue
  , gray;
for (i = 0; i < 256; ++i)
	histogram[i] = 0;
for (i = 0; i < imData.data.length; i += 4) {
  red = imData.data[i];
  blue = imData.data[i + 1];
  green = imData.data[i + 2];
  // alpha = imData.data[i + 3];
  // https://en.wikipedia.org/wiki/Grayscale
  gray = red * .2126 + green * .07152 + blue * .0722;
  histogram[Math.round(gray)] += 1;
}
var threshold = otsu(histogram, imData.data.length / 4);
console.log("threshold = %s", threshold);
for (i = 0; i < imData.data.length; i += 4) {
  imData.data[i] = imData.data[i + 1] = imData.data[i + 2] =
    imData.data[i] >= threshold ? 255 : 0;
  // opacity 255 = 100%
  imData.data[i + 3] = 255;
}
ctx.putImageData(imData, 0, 0);
document.body.appendChild(cnv);
console.log("finished");
