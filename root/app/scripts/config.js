'use strict';

/**
 * Main module - App entry point
 * @module Main
 */

var Config = function() {
   return {
    imgList: [
      "static/img/hands.jpg",  
      "static/img/lana.jpg", 
      "static/img/couple.jpg", 
      "static/img/party.jpg"
    ],
    svgList : [
      //"static/svg/circle.svg",  
      "static/svg/rectangle.svg", 
      "static/svg/rectangle2.svg", 
      "static/svg/rectangle3.svg",  
      "static/svg/triangle.svg",
      "static/svg/triangle2.svg",
      "static/svg/triangle3.svg" 
    ],
    colorArray: [
      [
        [244, 176, 160],
        [190, 190, 190],
        [228, 211, 246],
        [254, 91, 10]
      ],
      [
        [244, 176, 160],
        [190, 190, 190],
        [228, 211, 246],
        [245, 232, 211]
      ],
      [
        [244, 176, 160],
        [190, 190, 190],
        [228, 211, 246],
        [245, 232, 211]
      ],
      [
        [255, 255, 255],
        [190, 190, 190],
        [131, 222, 208],
        [211, 245, 231]
      ]
    ],
    colorPairs: [
      {
        color1: [254, 91, 10],
        color2: [255, 202, 251],
        supportingColors: [
          [244, 176, 160],
          [190, 190, 190],
          [228, 211, 246]
        ]
      },
      {
        color1: [58, 112, 221],
        color2: [245, 232, 211],
        supportingColors: [
          [244, 176, 160],
          [190, 190, 190],
          [228, 211, 246]
        ]
      },
      {
        color1: [37, 145, 11],
        color2: [236, 227, 164],
        supportingColors: [
          [244, 176, 160],
          [190, 190, 190],
          [228, 211, 246]
        ]
      },
      {
        color1: [168, 124, 241],
        color2: [242, 148, 148],
        supportingColors: [
          [244, 176, 160],
          [190, 190, 190],
          [228, 211, 246]
        ]
      },
      {
        color1: [241, 124, 231],
        color2: [211, 245, 231],
        supportingColors: [
          [255, 255, 255],
          [190, 190, 190],
          [131, 222, 208]
        ]
      }
    ]
  }

 
};


