;(function () {
  function createLink(text, href) {
    var link = document.createElement('a')
    link.textContent = text
    link.href = href
    link.target = '_blank'
    return link
  }
  function die(reason) {
    var script = document.querySelector('script[type="module"]')
    script.remove()
    var overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.padding = '20px'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'center'
    overlay.style.flexDirection = 'column'
    var marquee = document.createElement('marquee')
    var h1 = document.createElement('h1')
    h1.textContent = 'Your browser is not supported'
    marquee.appendChild(h1)
    overlay.appendChild(marquee)
    var p = document.createElement('p')
    p.style.textAlign = 'center'
    p.textContent = 'Please upgrade your browser to latest version'
    p.appendChild(document.createElement('br'))
    p.append('Recommended browsers: ')
    p.appendChild(createLink('Chrome', 'https://www.google.com/chrome/'))
    p.append(', ')
    p.appendChild(createLink('Firefox', 'https://www.mozilla.org/firefox/'))
    p.append(', ')
    p.appendChild(createLink('Edge', 'https://www.microsoft.com/edge'))
    p.append(', ')
    p.appendChild(createLink('Vivaldi', 'https://vivaldi.com/'))
    overlay.appendChild(p)
    var pre = document.createElement('pre')
    pre.style.color = 'gray'
    pre.textContent = 'Reason: ' + reason
    overlay.appendChild(pre)
    document.body.appendChild(overlay)
  }
  var script = document.createElement('script')
  if (!('noModule' in script)) return die('Modern JavaScript not supported')
  try {
    eval("null ?? 'test';")
  } catch {
    return die('Nullish coalescing operator not supported')
  }
  if (!Array.prototype.at) return die('Array.prototype.at not supported')
})()
