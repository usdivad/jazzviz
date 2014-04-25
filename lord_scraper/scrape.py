# import urllib2, base64
# max_id = 205809
# url_base = 'http://www.lordisco.com.ezproxy.cul.columbia.edu/tjd/MusicianDetail?mid='
# url = url_base + str(max_id)

# req = urllib2.Request(url)
# base64string = base64.encodestring('%s:%s' %('dds2135', 'tqzR3GNk!')).replace('\n', '')
# req.add_header('Authorization', 'Basic %s' % base64string)
# result = urllib2.urlopen(req)

# print result.read()

for i in xrange(0,205809):
    print i+1



#Would be cool to go by session, e.g. visualize all the sessions in 1961