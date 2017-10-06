# -*- Mode:Python; indent-tabs-mode:nil; tab-width:4 -*-
#
# Copyright (C) 2015 Canonical Ltd
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License version 3 as
# published by the Free Software Foundation.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

"""This plugin is useful for building parts that use maven.

The maven build system is commonly used to build Java projects.
The plugin requires a pom.xml in the root of the source tree.

This plugin uses the common plugin keywords as well as those for "sources".
For more information check the 'plugins' topic for the former and the
'sources' topic for the latter.

Additionally, this plugin uses the following plugin-specific keywords:

    - maven-options:
      (list of strings)
      flags to pass to the build using the maven semantics for parameters.
"""

import glob
import logging
import os
from urllib.parse import urlparse
from xml.etree import ElementTree

import snapcraft
import snapcraft.common
import snapcraft.plugins.jdk


logger = logging.getLogger(__name__)


class MavenPlugin(snapcraft.plugins.jdk.JdkPlugin):

    @classmethod
    def schema(cls):
        schema = super().schema()
        schema['properties']['maven-options'] = {
            'type': 'array',
            'minitems': 1,
            'uniqueItems': True,
            'items': {
                'type': 'string',
            },
            'default': [],
        }

        schema['properties']['maven-targets'] = {
            'type': 'array',
            'minitems': 1,
            'uniqueItems': True,
            'items': {
                'type': 'string',
            },
            'default': [''],
        }

        return schema

    def __init__(self, name, options, project):
        super().__init__(name, options, project)
        self.build_packages.append('maven')

    def _use_proxy(self):
        return any(k in os.environ for k in ('http_proxy', 'https_proxy'))

    @classmethod
    def get_build_properties(cls):
        # Inform Snapcraft of the properties associated with building. If these
        # change in the YAML Snapcraft will consider the build step dirty.
        return ['maven-options', 'maven-targets']

    def build(self):
        super().build()

        mvn_cmd = ['mvn', 'package']
        if self._use_proxy():
            settings_path = os.path.join(self.partdir, 'm2', 'settings.xml')
            _create_settings(settings_path)
            mvn_cmd += ['-s', settings_path]

        self.run(mvn_cmd + self.options.maven_options)

        for f in self.options.maven_targets:
            src = os.path.join(self.builddir, f, 'target')
            jarfiles = glob.glob(os.path.join(src, '*.jar'))
            warfiles = glob.glob(os.path.join(src, '*.war'))
            types = ('*.tar.gz', '*.zip', '.*.tgz', '*.war', '*.jar')
            arfiles = []
            for files in types:
                arfiles.extend(glob.glob(os.path.join(src, files)))


            tarfiles = glob.glob(os.path.join(src, '*.tar.gz'))

            if len(arfiles) == 0:
                raise RuntimeError("Could not find any "
                                   "built files for part")
            if len(jarfiles) > 0 and len(f) == 0:
                basedir = 'jar'
            elif len(warfiles) > 0 and len(f) == 0:
                basedir = 'war'
            else:
                basedir = 'zip'

            targetdir = os.path.join(self.installdir, basedir)
            print(targetdir)
            os.makedirs(targetdir, exist_ok=True)
            for f in arfiles:
                base = os.path.basename(f)
                os.link(f, os.path.join(targetdir, base))


def _create_settings(settings_path):
    settings = ElementTree.Element('settings', attrib={
        'xmlns': 'http://maven.apache.org/SETTINGS/1.0.0',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': (
            'http://maven.apache.org/SETTINGS/1.0.0 '
            'http://maven.apache.org/xsd/settings-1.0.0.xsd'),
        })
    element = ElementTree.Element('interactiveMode')
    element.text = 'false'
    settings.append(element)
    proxies = ElementTree.Element('proxies')
    for protocol in ('http', 'https'):
        env_name = '{}_proxy'.format(protocol)
        if env_name not in os.environ:
            continue
        proxy_url = urlparse(os.environ[env_name])
        proxy = ElementTree.Element('proxy')
        proxy_tags = [
            ('id', env_name),
            ('active', 'true'),
            ('protocol', protocol),
            ('host', proxy_url.hostname),
            ('port', str(proxy_url.port)),
            ]
        if proxy_url.username is not None:
            proxy_tags.extend([
                ('username', proxy_url.username),
                ('password', proxy_url.password),
                ])
        proxy_tags.append(('nonProxyHosts', _get_no_proxy_string()))
        for tag, text in proxy_tags:
            element = ElementTree.Element(tag)
            element.text = text
            proxy.append(element)
        proxies.append(proxy)
    settings.append(proxies)
    tree = ElementTree.ElementTree(settings)
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)
    with open(settings_path, 'w') as f:
        tree.write(f, encoding='unicode')
        f.write('\n')


def _get_no_proxy_string():
    no_proxy = [k.strip() for k in
                os.environ.get('no_proxy', 'localhost').split(',')]
    return '|'.join(no_proxy)
