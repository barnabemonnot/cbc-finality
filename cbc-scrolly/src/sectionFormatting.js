const formatSection = function(section) {
  return {
    name: section.innerText
  }
};

const titles = document.getElementsByClassName('section-label');
const unformattedSections = Object.values(titles).map(
  (title, idx) => [title, idx]
).filter(
  d => d[0].getAttribute('class').includes('section-title')
).map(
  (d, i, a) => {
    return {
      section: d[0],
      subsections: Object.values(titles).filter(
        (title, idx) => title.getAttribute('class').includes('section-sub-title') && (idx < (i == (a.length-1) ? titles.length : a[i+1][1])) && (idx > a[i][1])
      )
    }
  }
);

unformattedSections.forEach(
  (section, secidx) => {
    section.section.setAttribute("id", "sec-" + (secidx+1));
    section.subsections.forEach(
      (subsection, subsecidx) => {
        subsection.setAttribute("id", "subsec-" + (secidx+1) + "-" + (subsecidx+1));
      }
    )
  }
);

const sections = unformattedSections.map(
  section => {
    return {
      section: formatSection(section.section),
      subsections: section.subsections.map(
        subsection => formatSection(subsection)
      )
    };
  }
);

ReactDOM.render(
  React.createElement(TOC, {
    sections: sections
  }),
  document.querySelector("#toc")
);
