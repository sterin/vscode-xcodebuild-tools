from setuptools import setup

setup(
    name="xcodebuild_tools",
    py_modules=["xcodebuild_tools"],
    install_requires=[
        'click'
    ],
    entry_points={
        'console_scripts': [
            'xcodebuild_tools = xcodebuild_tools:cli',
        ],
    }
)
