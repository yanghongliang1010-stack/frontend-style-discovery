"""Behavioral checks for the reusable gallery builder's input and file boundary."""
import base64
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('gallery_builder', ROOT / 'skills/frontend-style-discovery/scripts/build_gallery.py')
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)
PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=')


class GalleryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.input = self.root / 'inputs'
        self.input.mkdir()
        (self.input / 'image.png').write_bytes(PNG)
        self.record = {'id': 21, 'title': 'A reference', 'source_url': 'https://example.com/design', 'image': 'image.png', 'tags': ['spatial']}

    def tearDown(self):
        self.temp.cleanup()

    def build(self, records):
        manifest = self.input / 'references.json'
        manifest.write_text(json.dumps({'schema_version': 1, 'project_id': 'test', 'references': records}))
        return BUILDER.build(manifest, self.root / 'gallery')

    def test_local_preview_and_source_only_record(self):
        result = self.build([self.record, {'id': 22, 'title': 'Link only', 'source_url': 'https://example.com/another'}])
        self.assertEqual((result['references'], result['previews']), (2, 1))
        output = self.root / 'gallery'
        data = json.loads((output / 'manifest.json').read_text())
        self.assertEqual((output / data['references'][0]['image']).read_bytes(), PNG)
        self.assertIsNone(data['references'][1]['image'])

    def test_duplicate_ids_fail_before_writing(self):
        with self.assertRaises(ValueError):
            self.build([self.record, self.record.copy()])
        self.assertFalse((self.root / 'gallery').exists())

    def test_escape_and_symlink_outside_input_are_rejected(self):
        (self.root / 'outside.png').write_bytes(PNG)
        (self.input / 'link.png').symlink_to(self.root / 'outside.png')
        for image in ['../outside.png', 'link.png', str(self.root / 'outside.png')]:
            with self.subTest(image=image), self.assertRaises(ValueError):
                self.build([{**self.record, 'image': image}])
        self.assertFalse((self.root / 'gallery').exists())

    def test_unsafe_url_and_remote_image_are_rejected(self):
        for url in ['javascript:alert(1)', 'https://user:secret@example.com/', 'https://example.com/\nfoo']:
            with self.subTest(url=url), self.assertRaises(ValueError):
                self.build([{**self.record, 'source_url': url}])
        with self.assertRaises(ValueError):
            self.build([{**self.record, 'image': 'https://example.com/preview.png'}])

    def test_original_input_is_not_an_output_target(self):
        self.build([self.record])
        with self.assertRaises(ValueError):
            BUILDER.build(self.input / 'references.json', self.input)
        self.assertEqual((self.input / 'image.png').read_bytes(), PNG)


if __name__ == '__main__':
    unittest.main()
