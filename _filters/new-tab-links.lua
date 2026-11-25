-- This filter is opt-in per lesson. Keep local jumps and page controls in place.
function Link(link)
  if not link.target:match('^#') and not link.target:match('^mailto:') then
    link.attributes.target = '_blank'
    link.attributes.rel = 'noopener noreferrer'
  end
  return link
end
