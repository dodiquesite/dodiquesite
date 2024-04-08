from pyrosm import OSM
from pyrosm import get_data
import gzip
import json

data = OSM('greece-monuments.pbf')

transit = data.get_data_by_custom_criteria(custom_filter={'historic': True},
                                        osm_keys_to_keep=['historic'],
                                        filter_type="keep",
                                        tags_as_columns=['lat', 'lon', 'historic', 'name', 'name:en', 'description', 'note', 'wikidata', 'wikipedia'],
                                        keep_nodes=True,
                                        keep_ways=False,
                                        keep_relations=False)

def clear_underscore(string):
    return string.replace('_', ' ').replace(':', ' ')

interest_tags = ['memorial', 'religion', 'denomination', 'civilization', 'historic:civilization']

monuments = []

for _, row in transit.iterrows():
    historic_as_name = False
    monument_rec = {'lat': 0, 'lon': 0, 'name': '', 'attrs': {}, 'desc': '', 'link': ''}
    if row['name:en']:
        monument_rec['name'] = row['name:en']
    elif row['name'] and not row['name'].isdigit():
        monument_rec['name'] = row['name']
    elif row['historic'] != 'yes':
        monument_rec['name'] = clear_underscore(row['historic'])
        historic_as_name = True
    else:
        continue

    desc = ''
    if row['description']:
        desc = row['description']
    if row['note']:
        desc += r'\nNote: ' + row['note']
    if desc:
        monument_rec['desc'] = desc

    if row['wikidata']:
        monument_rec['link'] = 'https://www.wikidata.org/wiki/' + row['wikidata']
    if row['wikipedia']:
        monument_rec['link'] = 'https://wikipedia.org/wiki/' + row['wikipedia']

    if row['tags']:
        tags = json.loads(row['tags'])
        for tag in tags:
            if tag in interest_tags:
                monument_rec['attrs'][clear_underscore(tag)] = clear_underscore(tags[tag])
    if not historic_as_name and row['historic'] and row['historic'] != "yes":
        monument_rec['attrs']['type'] = clear_underscore(row['historic'])

    monument_rec['lon'] = row['lon']
    monument_rec['lat'] = row['lat']
    monuments.append(monument_rec)

result = json.dumps(monuments)
file = gzip.open('public/resource/greece-monuments.json.gz', 'wb')
file.write(bytes(result, 'utf-8'))
file.close()