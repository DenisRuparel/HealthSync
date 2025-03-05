provider "aws" {
  region = var.aws_region
  profile = "default"
}

resource "aws_iam_role" "ssm_role" {
  name = "healthsync_ssm_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy_attachment" "ssm_attachment" {
  name       = "healthsync_ssm_attachment"
  roles      = [aws_iam_role.ssm_role.name]
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_instance_profile" {
  name = "healthsync_ssm_instance_profile"
  role = aws_iam_role.ssm_role.name
}

resource "tls_private_key" "healthsync_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "local_file" "private_key" {
  content  = tls_private_key.healthsync_key.private_key_pem
  filename = "${path.module}/keys/healthsync_key.pem"
}

resource "aws_key_pair" "deployer" {
  key_name   = "healthsync_key"
  public_key = tls_private_key.healthsync_key.public_key_openssh
}

resource "aws_security_group" "healthsync_sg" {
  name_prefix = "healthsync_sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "HealthSync" {
  ami             = var.ami_id
  instance_type   = var.instance_type
  key_name        = aws_key_pair.deployer.key_name
  security_groups = [aws_security_group.healthsync_sg.name]
  associate_public_ip_address = true
  iam_instance_profile   = aws_iam_instance_profile.ssm_instance_profile.name

  tags = {
    Name = "HealthSync"
  }
}