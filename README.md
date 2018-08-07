# `faz`

A tool for scraping [PISA](https://www.ebi.ac.uk/msd-srv/prot_int/pistart.html) to obtain tabulated data about peptide interfaces.

## Features

### Present

- Upon running this version of the `faz` script (see instructions below), several properties for interfacial residues will be downloaded in the form of a CSV.

### Planned

- A forthcoming update will generate an HTML document showing shared interfaces (useful for e.g. ligand-binding interfaces).
- A future update will also add a browser extension for ease of use.
- ???

## Usage

To use this version of the `faz` script, simply [launch PISA](https://www.ebi.ac.uk/msd-srv/prot_int/cgi-bin/piserver) and look up the desired structure by its PDB number, then select "Interfaces". Choose the interface of interest, then [bring up the JavaScript console for your browser](https://webmasters.stackexchange.com/a/77337) and paste the contents of [`faz.js`](faz.js) into the console. You may or may not need to press return.

If the CSV file does not download upon termination of the script, try allowing popups for the PISA domain.

## License

`faz` is MIT-licensed.

## Disclaimer

The script in its present incarnation is somewhat rough around the edges; I intend to make it more robust and add more features sometime (fall 2018), but I am pushing what I have for now.
