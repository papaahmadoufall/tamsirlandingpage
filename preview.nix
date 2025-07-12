nix
{ pkgs ? import <nixpkgs> {} }:

let
  live-server-script = pkgs.writeShellScript "live-server-script" ''
    ${pkgs.nodePackages.live-server}/bin/live-server . --port=3000
  '';
in
pkgs.stdenv.mkDerive {
  name = "static-site-preview";
  src = ./.;
  buildInputs = [ pkgs.nodePackages.live-server ];
  shellHook = ''
    echo "Starting live-server on port 3000..."
    exec ${live-server-script}
  '';
}