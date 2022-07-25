import axios from "axios";
import cheerio from "cheerio";

// TODO - refactor this, simplify how to get the texts
const getWeeklyParts = (url, week) =>
  axios
    .get(`${url}/${week}`)
    .then(({ data: body }) => {
      const parts = {};

      const $ = cheerio.load(body);
      parts.weekTitle = $("#p1").find("h1 strong").text().trim().toUpperCase();
      // parts.weekLecture = $('#article .todayItem .itemData header').find('h2 a strong').text().trim()
      parts.song1 = $("#article .todayItem .itemData .bodyTxt #section1 ul")
        .find("li a strong")
        .text()
        .trim().toString();
      parts.firstComments = $(
        "#article .todayItem .itemData .bodyTxt #section1 ul"
      )
        .find("li #p4")
        .text()
        .toString();
      parts.section1Title = $(
        "#article .todayItem .itemData .bodyTxt #section2"
      )
        .find("#p5 strong")
        .text()
        .toString();
      parts.treasuresSpeech = $(
        "#article .todayItem .itemData .bodyTxt #section2"
      )
        .find("#p6")
        .text()
        .toString();
      parts.jewels = $("#article .todayItem .itemData .bodyTxt #section2")
        .find("#p7")
        .text()
        .toString();
      parts.bibleLecture =
        $("#article .todayItem .itemData .bodyTxt #section2")
          .find("#p10")
          .text()
          .toString()
          .split(")")[0] + ")";
      parts.section2Title = $(
        "#article .todayItem .itemData .bodyTxt #section3"
      )
        .find("#p11 strong")
        .text()
        .toString();
      parts.section2Parts = [];
      $("#article .todayItem .itemData .bodyTxt #section3 .pGroup")
        .find("ul li")
        .each(function () {
          parts.section2Parts.push($(this).text().toString().trim().split(")")[0] + ")");
        });
      parts.section3Title = $(
        "#article .todayItem .itemData .bodyTxt #section4"
      )
        .find("#p15 strong")
        .text()
        .toString();
      parts.sectionAll3Parts = [];
      $("#article .todayItem .itemData .bodyTxt #section4")
        .find("ul li")
        .each(function () {
          let value = $(this).text().toString().trim();

          if (value.includes(": (")) {
            value = value.split(")")[0] + ")";
          }

          if (!value.includes("oração")) {
            parts.sectionAll3Parts.push(value);
            return;
          }

          value = value.split("e")[0];
          parts.sectionAll3Parts.push(value);
          parts.sectionAll3Parts.push("Oração Final");
        });

      console.log("fetch parts successfully for week", week);
      return parts;
    })
    .catch((err) => console.log("FETCH ERROR", err.message));

export default getWeeklyParts;
