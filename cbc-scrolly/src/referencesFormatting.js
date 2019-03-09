let refs = document.getElementsByClassName('reference');
Object.values(refs).forEach(
  (ref, idx) => {
    if (Object.values(refs).map(
      r => r.getAttribute('refid')
    ).indexOf(ref.getAttribute('refid')) == idx) {
      ref.setAttribute('id', 'ref-' + ref.getAttribute('refid'));
    }
  }
);
let bibliographyData = _.uniq(
  Object.values(refs).map(
    ref => {
      let refid = ref.getAttribute('refid');
      return _.extend(referenceData[refid], { refid: refid });
    }
  ),
  item => item.refid
);

Object.values(refs).forEach(
  d => {
    let refidx =  _.indexOf(
      bibliographyData.map(bib => bib.refid),
      d.getAttribute('refid')
    ) + 1;
    ReactDOM.render(
      React.createElement(ReferenceInText, { refidx }),
      d
    );
  }
);

ReactDOM.render(
  React.createElement(ReferenceContainer, {
    references: bibliographyData
  }),
  document.querySelector("#reference-container")
);
