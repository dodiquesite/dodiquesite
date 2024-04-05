from pyrosm import OSM
from pyrosm import get_data
import gzip

data = OSM('greece-monuments.pbf')

cols = ['lat', 'lon', 'historic', 'name', 'description', 'note', 'wikidata', 'wikipedia']

transit = data.get_data_by_custom_criteria(custom_filter={'historic': True},
                                        osm_keys_to_keep=['historic'],
                                        filter_type="keep",
                                        tags_as_columns=['lat', 'lon', 'historic', 'name', 'description', 'note', 'wikidata', 'wikipedia'],
                                        keep_nodes=True,
                                        keep_ways=False,
                                        keep_relations=False)

data = transit[cols]

result = data.to_json(orient="values")
file = gzip.open('greece-monuments.json.gz', 'wb')
file.write(bytes(result, 'utf-8'))
file.close()