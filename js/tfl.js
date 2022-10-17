export const fetchTFL = async () => {
      fetch("https://tfl.gov.uk/tfl/syndication/feeds/step-free-tube-guide.xml")
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "application/xml");
        console.log(xml);

            var x, i, j, accessibilityLevel, txt, txt2;
            txt = "";
            txt2 = "";
            x = xml.getElementsByTagName('StationName');
            accessibilityLevel = xml.getElementsByTagName('AccessibilityType');
            for (i = 0 ; i <x.length; i++) {
                txt += x[i].childNodes[0].nodeValue + "<br>";
            }
           for (j = 0 ; j <accessibilityLevel.length; j++) {
                txt2 += accessibilityLevel[j].childNodes[0].nodeValue + "<br>";
           }
            document.getElementById("column1").innerHTML = txt;
            document.getElementById("column2").innerHTML = txt2;
      })
      .catch(console.error);
  };