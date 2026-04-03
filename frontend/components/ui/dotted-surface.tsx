'use client';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	const { theme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		geometry: THREE.BufferGeometry;
		animationId: number;
	} | null>(null);

	// Wait for mount to avoid hydration mismatch with useTheme
	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted || !containerRef.current) return;

		const SEPARATION = 100;
		const AMOUNTX = 40;
		const AMOUNTY = 40;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
		camera.position.set(0, 500, 1000);
		camera.lookAt(0, 0, 0);

		const renderer = new THREE.WebGLRenderer({ 
			alpha: true, 
			antialias: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
		renderer.setClearColor(0x000000, 0);
		
		const canvas = renderer.domElement;
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.display = 'block';
		
		containerRef.current.appendChild(canvas);

		const positions = new Float32Array(AMOUNTX * AMOUNTY * 3);
		const colors = new Float32Array(AMOUNTX * AMOUNTY * 3);
		
		const currentTheme = resolvedTheme || theme || 'light';
		const color = currentTheme === 'dark' ? 0.9 : 0;

		for (let i = 0; i < AMOUNTX; i++) {
			for (let j = 0; j < AMOUNTY; j++) {
				const index = (i * AMOUNTY + j) * 3;
				positions[index] = i * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				positions[index + 1] = 0;
				positions[index + 2] = j * SEPARATION - (AMOUNTY * SEPARATION) / 2;
				
				colors[index] = color;
				colors[index + 1] = color;
				colors[index + 2] = color;
			}
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 4,
			vertexColors: true,
			transparent: true,
			opacity: 0.4,
			sizeAttenuation: true
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let count = 0;
		let animationId: number = 0;

		const animate = () => {
			animationId = requestAnimationFrame(animate);
			const positions = geometry.attributes.position.array as Float32Array;
			
			for (let i = 0; i < AMOUNTX; i++) {
				for (let j = 0; j < AMOUNTY; j++) {
					const index = (i * AMOUNTY + j) * 3 + 1;
					positions[index] = (Math.sin((i + count) * 0.3) * 50) + (Math.sin((j + count) * 0.5) * 50);
				}
			}
			
			geometry.attributes.position.needsUpdate = true;
			renderer.render(scene, camera);
			count += 0.05;
		};

		animate();

		const handleResize = () => {
			if (!containerRef.current) return;
			const width = containerRef.current.clientWidth;
			const height = containerRef.current.clientHeight;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};

		window.addEventListener('resize', handleResize);

		sceneRef.current = { scene, camera, renderer, geometry, animationId };

		return () => {
			window.removeEventListener('resize', handleResize);
			if (sceneRef.current) {
				cancelAnimationFrame(sceneRef.current.animationId);
				sceneRef.current.geometry.dispose();
				material.dispose();
				sceneRef.current.renderer.dispose();
				if (containerRef.current && canvas.parentNode === containerRef.current) {
					containerRef.current.removeChild(canvas);
				}
			}
		};
	}, [mounted, theme, resolvedTheme]);

	if (!mounted) return <div className={cn('absolute inset-0 -z-1', className)} />;

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none absolute inset-0 -z-1 overflow-hidden', className)}
			{...props}
		/>
	);
}
